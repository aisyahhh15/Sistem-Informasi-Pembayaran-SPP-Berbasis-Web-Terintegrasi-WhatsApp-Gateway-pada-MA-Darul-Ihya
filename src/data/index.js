export const DEMO_PERIOD = { month: 10, year: 2026, label: 'Oktober 2026' };

const classSeed = [
  { id: 'class-x-a', name: 'X-A', homeroomTeacher: 'Ustazah Rahma' },
  { id: 'class-x-b', name: 'X-B', homeroomTeacher: 'Ustaz Ahmad' },
  { id: 'class-xi-a', name: 'XI-A', homeroomTeacher: 'Ustazah Nadia' },
  { id: 'class-xi-b', name: 'XI-B', homeroomTeacher: 'Ustaz Fikri' },
  { id: 'class-xii-a', name: 'XII-A', homeroomTeacher: 'Ustazah Salma' },
  { id: 'class-xii-b', name: 'XII-B', homeroomTeacher: 'Ustaz Haris' },
];

const initialStudents = [
  { id: 'student-001', nis: '26001', name: 'Alya Nurfadila', classId: 'class-x-a', parentWhatsapp: '6281200000101', status: 'Aktif' },
  { id: 'student-002', nis: '26002', name: 'Faris Ramadhan', classId: 'class-x-a', parentWhatsapp: '6281200000102', status: 'Aktif' },
  { id: 'student-003', nis: '25014', name: 'Nabila Safitri', classId: 'class-xi-a', parentWhatsapp: '6281200000103', status: 'Aktif' },
  { id: 'student-004', nis: '25021', name: 'Rizky Maulana', classId: 'class-xi-a', parentWhatsapp: '6281200000104', status: 'Aktif' },
  { id: 'student-005', nis: '24009', name: 'Hana Kamila', classId: 'class-xii-a', parentWhatsapp: '6281200000105', status: 'Aktif' },
  { id: 'student-006', nis: '24017', name: 'Ilham Fauzan', classId: 'class-xii-a', parentWhatsapp: '6281200000106', status: 'Aktif' },
];

const givenNames = ['Adelia', 'Ahmad', 'Aisyah', 'Akhmad', 'Amira', 'Anisa', 'Arif', 'Azka', 'Daffa', 'Dina', 'Fahri', 'Fania', 'Farhan', 'Fauziah', 'Hafiz', 'Hanif', 'Ihsan', 'Imani', 'Intan', 'Kamil', 'Karima', 'Latif', 'Miftah', 'Nadia', 'Naufal', 'Nisa', 'Rafi', 'Rania', 'Salma', 'Zahra'];
const familyNames = ['Abdillah', 'Amalia', 'Azizah', 'Fadhilah', 'Hakim', 'Hidayat', 'Kurniawan', 'Maulida', 'Mubarak', 'Munawar', 'Nugraha', 'Pratama', 'Rahman', 'Ramadhani', 'Salsabila', 'Saputra', 'Setiawan', 'Syahputra', 'Wahyuni', 'Yusuf'];
const gradeClassIds = ['class-x-a', 'class-x-b', 'class-xi-a', 'class-xi-b', 'class-xii-a', 'class-xii-b'];
const students = [
  ...initialStudents,
  ...Array.from({ length: 78 }, (_, offset) => {
    const index = offset + initialStudents.length;
    const given = givenNames[offset % givenNames.length];
    const family = familyNames[Math.floor(offset / givenNames.length) % familyNames.length];
    return {
      id: `student-${String(index + 1).padStart(3, '0')}`,
      nis: String(26000 + index + 1),
      name: `${given} ${family}`,
      classId: gradeClassIds[Math.floor(offset / 13)],
      parentWhatsapp: `628120001${String(index + 1).padStart(4, '0')}`,
      status: 'Aktif',
    };
  }),
];

const unpaidStudentIds = new Set(['student-002', 'student-004', 'student-006']);
const octoberInvoices = students.map((student, index) => ({
  id: `inv-2026-10-${String(index + 1).padStart(3, '0')}`,
  studentId: student.id,
  month: 10,
  year: 2026,
  schoolYear: '2026/2027',
  amount: 250000,
  paidAmount: unpaidStudentIds.has(student.id) ? 0 : 250000,
  status: unpaidStudentIds.has(student.id) ? 'unpaid' : 'paid',
}));

const octoberTransactions = octoberInvoices
  .filter((invoice) => invoice.status === 'paid')
  .map((invoice, index) => ({
    id: `TRX-2610${String(index + 1).padStart(3, '0')}`,
    invoiceId: invoice.id,
    studentId: invoice.studentId,
    amount: invoice.amount,
    date: `2026-10-${String((index % 26) + 1).padStart(2, '0')}`,
    method: ['Tunai', 'Transfer Bank', 'QRIS'][index % 3],
    status: 'Berhasil',
    balanceAfter: 0,
  }));
const teacherNames = [
  'Rahma Salsabila', 'Ahmad Fauzi', 'Nadia Hasanah', 'Fikri Maulana', 'Salma Zahra', 'Haris Setiawan',
  'Maya Kartika', 'Ridwan Hakim', 'Dewi Anggraini', 'Rizal Hidayat', 'Nur Aisyah', 'Fajar Ramadhan',
  'Siti Khadijah', 'Lukman Hakim', 'Nina Kurniawati', 'Yusuf Ardiansyah', 'Rina Marlina', 'Dedi Firmansyah',
  'Aminah Rahman', 'Ilham Saputra', 'Laila Fitriani', 'Budi Santoso', 'Farida Nursalim',
];

export const INITIAL_DATA = {
  classes: classSeed,
  students,
  teachers: teacherNames.map((name, index) => ({
    id: `teacher-${String(index + 1).padStart(2, '0')}`,
    name,
    status: 'Aktif',
  })),
  sppTariffs: [{ id: 'tariff-2026', schoolYear: '2026/2027', amount: 250000, status: 'Aktif' }],
  invoices: [
    ...octoberInvoices,
    { id: 'inv-2026-09-002', studentId: 'student-002', month: 9, year: 2026, schoolYear: '2026/2027', amount: 250000, paidAmount: 0, status: 'unpaid' },
    { id: 'inv-2026-09-004', studentId: 'student-004', month: 9, year: 2026, schoolYear: '2026/2027', amount: 250000, paidAmount: 250000, status: 'paid' },
  ],
  transactions: [
    ...octoberTransactions,
    { id: 'TRX-260904', invoiceId: 'inv-2026-09-004', studentId: 'student-004', amount: 250000, date: '2026-09-18', method: 'Transfer Bank', status: 'Berhasil', balanceAfter: 0 },
  ],
  waTemplates: [
    { id: 'wa-confirmation', name: 'Konfirmasi pembayaran', body: 'Assalamuâ€™alaikum {nama}, pembayaran SPP periode {periode} sebesar {nominal} telah dicatat. Sisa tagihan: {sisa}. Pesan ini adalah simulasi.', status: 'Siap (Simulasi)' },
    { id: 'wa-reminder', name: 'Pengingat pembayaran', body: 'Assalamuâ€™alaikum {nama}, ini pengingat simulasi untuk tagihan SPP {periode}. Sisa tagihan: {sisa}. Silakan menghubungi bendahara sekolah untuk informasi.', status: 'Siap (Simulasi)' },
  ],
  waMessages: [],
};
