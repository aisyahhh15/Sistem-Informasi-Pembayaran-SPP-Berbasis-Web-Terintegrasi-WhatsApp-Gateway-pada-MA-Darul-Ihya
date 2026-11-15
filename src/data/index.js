export const DEMO_PERIOD = { month: 10, year: 2026, label: 'Oktober 2026' };
export const PAYMENT_SCHEMES = ['Reguler', 'Bantuan Yatim', 'Beasiswa PIP'];
export const PAYMENT_METHODS = ['Tunai', 'Transfer Bank'];

const classSeed = [
  { id: 'class-x', name: 'Kelas X', homeroomTeacher: '' },
  { id: 'class-xi', name: 'Kelas XI', homeroomTeacher: '' },
  { id: 'class-xii', name: 'Kelas XII', homeroomTeacher: '' },
];

const roster = [
  { grade: 'class-xii', names: [
    'Agustian Ramadani', 'Ahmad Sholeh Astuti Musthafa', 'Aifa Andini', 'Cantika Mutiara Cinta', 'Cindy Ramadhina',
    'Effana Risti Wardatuljannah', 'Hibban Wirayuda', 'Ibrahim', 'Ivan Ferdiansyah', 'Latifah Masruroh',
    'M Reihan Saputra', 'Mohammad Fakhri Ghifari', 'Muhamad Ridwan Alkhawaris', 'Muhamad Ridzi Syaputra', 'Muhamad Sopian',
    'Muhamad Salman Al-Farisi', 'Muhammad Alif Gunawan', 'Muhammad Aqila Ainulhayat', 'Muhammad Arian Putra', 'Muhammad Irgi Ramadhan',
    'Mutia Wulansari', 'Nailah Nur Alifah', 'Nur Aenni', 'Putri Nurhikmah', 'Raditya Dhika Ilyasin',
    'Ridlya Annalis', 'Satria Wibawa Ramadhan', 'Shakira Lutfiah', 'Sifa Khoirunisa', 'Sila Fauzia',
    'Siti Nur Linda', 'Siti Nur Moulinda', 'Siti Nurohmah', 'Syayida Nuraisyah', 'Yola Putriyansyah',
  ] },
  { grade: 'class-xi', names: [
    "Aiman Rif'at", 'Aisyah Kamilatunnisa Al Ayubi', 'Alfani Rianti', 'Alfiarizky Dafi Ardani', 'Azka Azzahra Fauziah',
    'Azril Aditiya', 'Azza Rahmadani', 'Bima Ihsan Maulana', 'Bintang Muhamad Kamandanu', 'Diva Putri Wahyu Ananda',
    'Ilham Rizki Ritonga', 'Mochammad Ilham', 'Muhamad Al Farisi', 'Muhamad Dimas Rifki Rifai', 'Muhamad Radhil Bana Arafif',
    'Muhammad Alfatih Karim', 'Muhammad Ardiansyah', 'Muhammad Hasbi Ash Syddieqy', 'Nurul Fitri Khairani', 'Prabowo Raditya Hidayat',
    'Rama Aditya Ilham', 'Riana Putri Ramadani', 'Rini Siti Aminah', 'Siti Silpa Al Magfiroh', 'Susan Nurul Fadilah',
    'Syifa Aulia', 'Ahmad Shaleh',
  ] },
  { grade: 'class-x', names: [
    'Ahmad Fadilah', 'Amirah Yassar Nova', 'Ayu Rudiwati', 'Daffa Kasyfur Rahman', 'Dewi Putri Rahayu',
    'Farah Aulia Rahma', 'Fitri Agustin', 'Fitria Ramadanti', 'Haikal', 'M Fahrezi Hermawan',
    'Mikaila Amira Nurfitri', 'Moh Romi Wahtudiarta', 'Muhamad Abyan Hidayat', 'Muhamad Al Zahida', 'Muhamad Azril Maulana',
    'Muhamad Pahri Al Husaeni', 'Muhammad Fatihul Ilmi Ad Dhururi', 'Muhammad Wildan', 'Mutia Hanifah', 'Nabila Putri Maharani',
    'Nafsyi Nafsiah Rustandi', 'Octa Dinansyah Setiawan', 'Siti Adelia', 'Siti Arsyila', 'Suci Nur Hikmah',
  ] },
];

const students = roster.flatMap(({ grade, names }) => names.map((name) => ({ name, grade })))
  .map(({ name, grade }, index) => ({
    id: `student-${String(index + 1).padStart(3, '0')}`,
    nis: String(26001 + index),
    name,
    classId: grade,
    parentWhatsapp: `628120001${String(index + 1).padStart(4, '0')}`,
    status: 'Aktif',
    paymentScheme: 'Reguler',
  }));

const arrearsDemoStudents = [
  ['student-demo-arrears-3', '26999', 'Ahmad Daniyal', 'class-xii', '6281200019999'],
  ['student-demo-arrears-3-2', '26998', 'Faris Al-Ghifari', 'class-xi', '6281200019998'],
  ['student-demo-arrears-3-3', '26997', 'Nabila Zahra', 'class-xi', '6281200019997'],
  ['student-demo-arrears-3-4', '26996', 'Rizky Maulana', 'class-x', '6281200019996'],
  ['student-demo-arrears-3-5', '26995', 'Siti Aisyah', 'class-x', '6281200019995'],
  ['student-demo-arrears-3-6', '26994', 'Fathur Rahman', 'class-xii', '6281200019994'],
].map(([id, nis, name, classId, parentWhatsapp]) => ({
  id, nis, name, classId, parentWhatsapp, status: 'Aktif', paymentScheme: 'Reguler',
}));
const arrearsDemoInvoices = arrearsDemoStudents.flatMap((student) => [8, 9, 10].map((month) => ({
  id: `inv-2026-${String(month).padStart(2, '0')}-${student.id}`,
  studentId: student.id,
  month,
  year: 2026,
  schoolYear: '2026/2027',
  amount: 250000,
  paidAmount: 0,
  status: 'unpaid',
})));

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
    method: ['Tunai', 'Transfer Bank'][index % 2],
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
  students: [...students, ...arrearsDemoStudents],
  teachers: teacherNames.map((name, index) => ({
    id: `teacher-${String(index + 1).padStart(2, '0')}`,
    name,
    status: 'Aktif',
  })),
  sppTariffs: [{ id: 'tariff-2026', schoolYear: '2026/2027', scheme: 'Reguler', amount: 250000, status: 'Aktif' }],
  invoices: [
    ...octoberInvoices,
    ...arrearsDemoInvoices,
    { id: 'inv-2026-08-002', studentId: 'student-002', month: 8, year: 2026, schoolYear: '2026/2027', amount: 250000, paidAmount: 0, status: 'unpaid' },
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
