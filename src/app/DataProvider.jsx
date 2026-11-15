import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEMO_PERIOD, INITIAL_DATA, PAYMENT_METHODS } from '../data';
import { getInvoiceBalance, getInvoicePaidAmount } from '../utils/formatters';
import { applyRapelPayments } from '../utils/rapelPayments';

const DataContext = createContext(null);
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const normalizePaymentMethod = (method) => PAYMENT_METHODS.includes(method) ? method : 'Transfer Bank';
const STORAGE_KEY = 'ma-darul-ihya-spp-demo-v1';
const ROSTER_MIGRATION_KEY = 'ma-darul-ihya-spp-roster-names-v2';
const PROFILE_KEY = 'ma-darul-ihya-spp-profile-v1';
const ACCOUNTS_KEY = 'ma-darul-ihya-spp-accounts-v1';
const DEFAULT_ACCOUNTS = [
  { id: 'account-admin', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Demo' },
  { id: 'account-tu', username: 'tu', password: 'tu12345', role: 'tu', name: 'Tata Usaha Demo' },
];

function includeDemoThreeMonthArrears(data) {
  const fixtureStudents = INITIAL_DATA.students.filter((student) => student.id.startsWith('student-demo-arrears-3'));
  const fixtureStudentIds = new Set(fixtureStudents.map((student) => student.id));
  const fixtureStudentById = new Map(fixtureStudents.map((student) => [student.id, student]));
  const fixtureInvoices = INITIAL_DATA.invoices.filter((invoice) => fixtureStudentIds.has(invoice.studentId));
  if (!fixtureStudents.length) return data;
  const invoices = [...data.invoices];
  fixtureInvoices.forEach((fixture) => {
    const alreadyExists = invoices.some((invoice) => invoice.id === fixture.id
      || (invoice.studentId === fixture.studentId && invoice.month === fixture.month && invoice.year === fixture.year));
    if (!alreadyExists) invoices.push({ ...fixture });
  });
  const currentStudentIds = new Set(data.students.map((student) => student.id));
  const missingStudents = fixtureStudents.filter((student) => !currentStudentIds.has(student.id));
  return {
    ...data,
    students: [
      ...data.students.map((student) => fixtureStudentById.has(student.id)
        ? { ...student, name: fixtureStudentById.get(student.id).name }
        : student),
      ...missingStudents.map((student) => ({ ...student })),
    ],
    invoices,
  };
}

function loadAccounts() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ACCOUNTS_KEY) || 'null');
    if (Array.isArray(saved) && saved.some((account) => account.id === 'account-admin' && account.role === 'admin')) return saved;
  } catch { /* Use the in-memory demo accounts when storage is unavailable. */ }
  return DEFAULT_ACCOUNTS;
}

function loadSavedData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const isValid = ['students', 'classes', 'sppTariffs', 'invoices', 'transactions', 'waTemplates', 'waMessages']
      .every((key) => Array.isArray(parsed[key]));
    if (!isValid) return null;

    if (window.localStorage.getItem(ROSTER_MIGRATION_KEY) === 'complete') {
      return includeDemoThreeMonthArrears({
        ...parsed,
        teachers: Array.isArray(parsed.teachers) ? parsed.teachers : INITIAL_DATA.teachers,
        students: parsed.students.map((student) => ({ ...student, paymentScheme: student.paymentScheme || 'Reguler' })),
        sppTariffs: parsed.sppTariffs.map((tariff) => ({ ...tariff, scheme: tariff.scheme || 'Reguler' })),
        transactions: parsed.transactions.map((transaction) => ({ ...transaction, method: normalizePaymentMethod(transaction.method) })),
      });
    }

    const existingStudents = new Map(parsed.students.map((student) => [student.id, student]));
    const rosterIds = new Set(INITIAL_DATA.students.map((student) => student.id));
    const classMigration = {
      'class-x-a': 'class-x', 'class-x-b': 'class-x',
      'class-xi-a': 'class-xi', 'class-xi-b': 'class-xi',
      'class-xii-a': 'class-xii', 'class-xii-b': 'class-xii',
    };
    const legacyClassIds = new Set(Object.keys(classMigration));
    const students = INITIAL_DATA.students.map((student) => {
      const previous = existingStudents.get(student.id);
      return previous
        ? { ...previous, name: student.name, classId: student.classId, paymentScheme: previous.paymentScheme || 'Reguler' }
        : student;
    });
    const additionalStudents = parsed.students
      .filter((student) => !rosterIds.has(student.id))
      .map((student) => ({
        ...student,
        classId: classMigration[student.classId] || student.classId,
        paymentScheme: student.paymentScheme || 'Reguler',
      }));
    const sppTariffs = parsed.sppTariffs.map((tariff) => ({ ...tariff, scheme: tariff.scheme || 'Reguler' }));
    const invoices = [...parsed.invoices];
    INITIAL_DATA.students
      .filter((student) => !existingStudents.has(student.id))
      .forEach((student) => {
        const tariff = sppTariffs.find((item) => item.status === 'Aktif' && item.scheme === (student.paymentScheme || 'Reguler'));
        const invoiceExists = invoices.some((invoice) => invoice.studentId === student.id && invoice.month === DEMO_PERIOD.month && invoice.year === DEMO_PERIOD.year);
        if (!tariff || invoiceExists) return;
        invoices.push({
          id: `inv-roster-${student.id}`,
          studentId: student.id,
          month: DEMO_PERIOD.month,
          year: DEMO_PERIOD.year,
          schoolYear: tariff.schoolYear,
          amount: tariff.amount,
          paidAmount: 0,
          status: 'unpaid',
        });
      });
    const migrated = {
      ...parsed,
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : INITIAL_DATA.teachers,
      classes: [
        ...INITIAL_DATA.classes,
        ...parsed.classes.filter((klass) => !legacyClassIds.has(klass.id) && !INITIAL_DATA.classes.some((item) => item.id === klass.id)),
      ],
      students: [...students, ...additionalStudents],
      sppTariffs,
      invoices,
      transactions: parsed.transactions.map((transaction) => ({ ...transaction, method: normalizePaymentMethod(transaction.method) })),
    };

    if (window.localStorage.getItem(ROSTER_MIGRATION_KEY) !== 'complete') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        window.localStorage.setItem(ROSTER_MIGRATION_KEY, 'complete');
      } catch { /* The migrated roster remains available in memory if storage is unavailable. */ }
    }
    return includeDemoThreeMonthArrears(migrated);
  } catch {
    return null;
  }
}

function loadAdminProfile() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || 'null');
    return saved && typeof saved.name === 'string' && typeof saved.email === 'string'
      ? { ...saved, defaultPaymentMethod: normalizePaymentMethod(saved.defaultPaymentMethod || 'Tunai') }
      : { name: 'Bendahara MA', email: 'bendahara@example.test', defaultPaymentMethod: 'Tunai' };
  } catch {
    return { name: 'Bendahara MA', email: 'bendahara@example.test', defaultPaymentMethod: 'Tunai' };
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => includeDemoThreeMonthArrears(loadSavedData() || structuredClone(INITIAL_DATA)));
  const [accounts, setAccounts] = useState(loadAccounts);
  const [adminProfile, setAdminProfile] = useState(loadAdminProfile);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [data]);
  useEffect(() => {
    try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(adminProfile)); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [adminProfile]);
  useEffect(() => {
    try { window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [accounts]);

  const actions = useMemo(() => ({
    saveStudent(student) {
      setData((current) => {
        const exists = current.students.some((item) => item.id === student.id);
        if (exists) {
          return { ...current, students: current.students.map((item) => item.id === student.id ? student : item) };
        }
        const newStudent = { ...student, paymentScheme: student.paymentScheme || 'Reguler', id: makeId('student') };
        const tariff = current.sppTariffs.find((item) => item.status === 'Aktif'
          && (item.scheme || 'Reguler') === newStudent.paymentScheme);
        const invoices = tariff ? [...current.invoices, {
          id: makeId('invoice'), studentId: newStudent.id,
          month: DEMO_PERIOD.month, year: DEMO_PERIOD.year,
          schoolYear: tariff.schoolYear, amount: tariff.amount, status: 'unpaid',
        }] : current.invoices;
        return { ...current, students: [...current.students, newStudent], invoices };
      });
    },
    deleteStudent(id) {
      setData((current) => {
        const invoiceIds = new Set(current.invoices.filter((item) => item.studentId === id).map((item) => item.id));
        return {
          ...current,
          students: current.students.filter((item) => item.id !== id),
          invoices: current.invoices.filter((item) => item.studentId !== id),
          transactions: current.transactions.filter((item) => item.studentId !== id && !invoiceIds.has(item.invoiceId)),
        };
      });
    },
    saveClass(klass) {
      setData((current) => {
        const exists = current.classes.some((item) => item.id === klass.id);
        return {
          ...current,
          classes: exists
            ? current.classes.map((item) => item.id === klass.id ? klass : item)
            : [...current.classes, { ...klass, id: makeId('class') }],
        };
      });
    },
    deleteClass(id) {
      setData((current) => ({ ...current, classes: current.classes.filter((item) => item.id !== id) }));
    },
    saveTariff(tariff) {
      setData((current) => {
        const exists = current.sppTariffs.some((item) => item.id === tariff.id);
        const nextTariffs = exists
          ? current.sppTariffs.map((item) => item.id === tariff.id ? tariff : item)
          : [...current.sppTariffs, { ...tariff, id: makeId('tariff') }];
        return {
          ...current,
        sppTariffs: nextTariffs.map((item) => ({
            ...item,
            scheme: item.scheme || 'Reguler',
            status: item.schoolYear === tariff.schoolYear ? 'Aktif' : 'Arsip',
          })),
        };
      });
    },
    deleteTariff(id) {
      setData((current) => ({ ...current, sppTariffs: current.sppTariffs.filter((item) => item.id !== id) }));
    },
    ensureInvoicesForPeriod({ month, year }) {
      if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) return { created: 0, missingTariff: 0 };
      const academicStart = month >= 7 ? year : year - 1;
      const schoolYear = `${academicStart}/${academicStart + 1}`;
      const current = dataRef.current;
      const existingKeys = new Set(current.invoices.map((invoice) => `${invoice.studentId}-${invoice.month}-${invoice.year}`));
      const invoices = [];
      let missingTariff = 0;
      current.students.filter((student) => student.status === 'Aktif').forEach((student) => {
        const key = `${student.id}-${month}-${year}`;
        if (existingKeys.has(key)) return;
        const scheme = student.paymentScheme || 'Reguler';
        const tariff = current.sppTariffs.find((item) => item.schoolYear === schoolYear && (item.scheme || 'Reguler') === scheme);
        if (!tariff) { missingTariff += 1; return; }
        invoices.push({ id: makeId('invoice'), studentId: student.id, month, year, schoolYear: tariff.schoolYear, amount: tariff.amount, paidAmount: 0, status: 'unpaid' });
      });
      if (invoices.length) {
        const nextData = { ...current, invoices: [...current.invoices, ...invoices] };
        dataRef.current = nextData;
        setData(nextData);
      }
      return { created: invoices.length, missingTariff };
    },
    recordPayment({ invoiceId, amount, date, method = 'Tunai' }) {
      const current = dataRef.current;
      const invoice = current.invoices.find((item) => item.id === invoiceId);
      const parsedDate = new Date(`${date}T00:00:00`);
      if (!invoice || !Number.isInteger(amount) || amount <= 0 || amount > getInvoiceBalance(invoice) || Number.isNaN(parsedDate.getTime())) return null;
      const id = `TRX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const paidAmount = getInvoicePaidAmount(invoice) + amount;
      const nextData = {
        ...current,
        invoices: current.invoices.map((item) => item.id === invoiceId
          ? { ...item, paidAmount, status: paidAmount >= item.amount ? 'paid' : 'partial' }
          : item),
        transactions: [...current.transactions, {
          id, invoiceId, studentId: invoice.studentId, amount, date, status: 'Berhasil',
          method: normalizePaymentMethod(method),
          balanceAfter: Math.max(0, invoice.amount - paidAmount),
        }],
      };
      dataRef.current = nextData;
      setData(nextData);
      return id;
    },
    recordRapelPayment({ payments, date, method = 'Tunai', recordedBy }) {
      const current = dataRef.current;
      const result = applyRapelPayments(current, {
        payments, date, method: normalizePaymentMethod(method), recordedBy: recordedBy || 'Petugas demo',
      });
      if (!result) return null;
      dataRef.current = result.data;
      setData(result.data);
      return result.transactionIds;
    },
    saveTemplate(template) {
      setData((current) => ({
        ...current,
        waTemplates: current.waTemplates.map((item) => item.id === template.id ? { ...item, name: template.name, body: template.body, status: 'Siap (Simulasi)' } : item),
      }));
    },
    sendWhatsAppSimulation({ studentId, templateId, templateName, recipient, body }) {
      const message = {
        id: makeId('wa'), studentId, templateId, templateName, recipient, body,
        status: 'Terkirim (Simulasi)', createdAt: new Date().toISOString(),
      };
      setData((current) => ({ ...current, waMessages: [message, ...current.waMessages] }));
      return message.id;
    },
  }), []);

  const updateDemoCredentials = (credentials) => setAccounts((current) => current.map((account) => account.id === 'account-admin'
    ? { ...account, username: credentials.username.trim(), password: credentials.password || account.password }
    : account));
  const createTuAccount = (account) => setAccounts((current) => [...current, {
    id: makeId('account-tu'), username: account.username.trim(), password: account.password,
    name: account.name.trim(), role: 'tu',
  }]);
  const updateTuAccount = (accountId, values) => setAccounts((current) => current.map((account) => account.id === accountId && account.role === 'tu'
    ? { ...account, username: values.username.trim(), name: values.name.trim(), password: values.password || account.password }
    : account));
  const deleteTuAccount = (accountId) => setAccounts((current) => current.filter((account) => account.id !== accountId || account.role !== 'tu'));
  const updateAdminProfile = (profile) => setAdminProfile({ name: profile.name.trim(), email: profile.email.trim(), defaultPaymentMethod: PAYMENT_METHODS.includes(profile.defaultPaymentMethod) ? profile.defaultPaymentMethod : 'Tunai' });
  const value = useMemo(() => ({ data, accounts, adminProfile, updateDemoCredentials, updateAdminProfile, createTuAccount, updateTuAccount, deleteTuAccount, ...actions }), [data, accounts, adminProfile, actions]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData harus digunakan di dalam DataProvider.');
  return value;
}
