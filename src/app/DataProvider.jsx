import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEMO_PERIOD, INITIAL_DATA } from '../data';
import { getInvoiceBalance, getInvoicePaidAmount } from '../utils/formatters';

const DataContext = createContext(null);
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const STORAGE_KEY = 'ma-darul-ihya-spp-demo-v1';
const PROFILE_KEY = 'ma-darul-ihya-spp-profile-v1';

function loadSavedData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    const isValid = ['students', 'classes', 'sppTariffs', 'invoices', 'transactions', 'waTemplates', 'waMessages']
      .every((key) => Array.isArray(parsed[key]));
    return isValid ? { ...parsed, teachers: Array.isArray(parsed.teachers) ? parsed.teachers : INITIAL_DATA.teachers } : null;
  } catch {
    return null;
  }
}

function loadAdminProfile() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || 'null');
    return saved && typeof saved.name === 'string' && typeof saved.email === 'string'
      ? { defaultPaymentMethod: 'Tunai', ...saved }
      : { name: 'Bendahara MA', email: 'bendahara@example.test', defaultPaymentMethod: 'Tunai' };
  } catch {
    return { name: 'Bendahara MA', email: 'bendahara@example.test', defaultPaymentMethod: 'Tunai' };
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => loadSavedData() || structuredClone(INITIAL_DATA));
  const [demoCredentials, setDemoCredentials] = useState({ username: 'admin', password: 'admin123' });
  const [adminProfile, setAdminProfile] = useState(loadAdminProfile);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [data]);
  useEffect(() => {
    try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(adminProfile)); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [adminProfile]);

  const actions = useMemo(() => ({
    saveStudent(student) {
      setData((current) => {
        const exists = current.students.some((item) => item.id === student.id);
        if (exists) {
          return { ...current, students: current.students.map((item) => item.id === student.id ? student : item) };
        }
        const newStudent = { ...student, id: makeId('student') };
        const tariff = current.sppTariffs.find((item) => item.status === 'Aktif');
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
            status: item.schoolYear === tariff.schoolYear ? 'Aktif' : 'Arsip',
          })),
        };
      });
    },
    deleteTariff(id) {
      setData((current) => ({ ...current, sppTariffs: current.sppTariffs.filter((item) => item.id !== id) }));
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
          method,
          balanceAfter: Math.max(0, invoice.amount - paidAmount),
        }],
      };
      dataRef.current = nextData;
      setData(nextData);
      return id;
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

  const updateDemoCredentials = (credentials) => setDemoCredentials((current) => ({
    username: credentials.username.trim(),
    password: credentials.password || current.password,
  }));
  const updateAdminProfile = (profile) => setAdminProfile({ name: profile.name.trim(), email: profile.email.trim(), defaultPaymentMethod: profile.defaultPaymentMethod || 'Tunai' });
  const value = useMemo(() => ({ data, demoCredentials, adminProfile, updateDemoCredentials, updateAdminProfile, ...actions }), [data, demoCredentials, adminProfile, actions]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData harus digunakan di dalam DataProvider.');
  return value;
}
