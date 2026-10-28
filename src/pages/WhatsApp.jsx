import React, { useMemo, useState } from 'react';
import { MessageSquare, Pencil, Send } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import EntityDialog from '../components/ui/EntityDialog';
import { useData } from '../app/DataProvider';
import { formatDate, formatPeriod, formatRupiah, getInvoiceBalance } from '../utils/formatters';

export default function WhatsApp() {
  const { data, saveTemplate, sendWhatsAppSimulation } = useData();
  const [studentId, setStudentId] = useState(data.students[0]?.id || '');
  const [templateId, setTemplateId] = useState(data.waTemplates[0]?.id || '');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [feedback, setFeedback] = useState('');
  const studentById = useMemo(() => Object.fromEntries(data.students.map((student) => [student.id, student])), [data.students]);
  const selectedStudent = studentById[studentId];
  const template = data.waTemplates.find((item) => item.id === templateId);
  const studentInvoices = data.invoices.filter((invoice) => invoice.studentId === studentId)
    .sort((a, b) => b.year - a.year || b.month - a.month);
  const openInvoice = studentInvoices.find((invoice) => getInvoiceBalance(invoice) > 0);
  const latestTransaction = [...data.transactions].filter((item) => item.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date))[0];
  const values = {
    nama: selectedStudent?.name || '[nama siswa]',
    periode: openInvoice ? formatPeriod(openInvoice.month, openInvoice.year) : studentInvoices[0] ? formatPeriod(studentInvoices[0].month, studentInvoices[0].year) : 'periode SPP',
    nominal: latestTransaction ? formatRupiah(latestTransaction.amount) : formatRupiah(openInvoice?.amount || 0),
    sisa: formatRupiah(openInvoice ? getInvoiceBalance(openInvoice) : 0),
  };
  const preview = (template?.body || '').replace(/\{(nama|periode|nominal|sisa)\}/g, (_, key) => values[key]);
  const succeeded = data.waMessages.filter((message) => message.status === 'Terkirim (Simulasi)').length;
  const handleSend = () => {
    if (!selectedStudent || !template || !selectedStudent.parentWhatsapp) return;
    sendWhatsAppSimulation({ studentId, templateId, templateName: template.name, recipient: selectedStudent.parentWhatsapp, body: preview });
    setFeedback(`Status Terkirim (Simulasi) dicatat untuk ${selectedStudent.name}. Tidak ada pesan sungguhan yang dikirim.`);
  };
  const handleTemplateSave = (values) => {
    saveTemplate({ ...editingTemplate, name: values.name.trim(), body: values.body.trim() });
    setEditingTemplate(null);
    setFeedback('Template simulasi berhasil diperbarui.');
  };

  return (
    <div>
      <PageHeader title="WhatsApp Gateway (Simulasi)" description="Pratinjau template dan catat hasil simulasi pesan. Tidak terhubung ke WhatsApp atau provider apa pun." />
      {feedback && <p className="inline-feedback" role="status">{feedback}</p>}
      <section className="wa-summary-grid">
        <article className="metric-card"><span className="metric-label">Mode Gateway</span><strong className="metric-value">Simulasi</strong><span className="metric-note">Tidak ada koneksi provider</span></article>
        <article className="metric-card"><span className="metric-label">Template tersedia</span><strong className="metric-value">{data.waTemplates.length}</strong><span className="metric-note">Dikelola di state demo</span></article>
        <article className="metric-card"><span className="metric-label">Status simulasi sukses</span><strong className="metric-value">{succeeded}</strong><span className="metric-note">Dari {data.waMessages.length} catatan</span></article>
      </section>

      <div className="wa-grid">
        <section className="content-card wa-compose-card">
          <div className="payment-card-heading"><MessageSquare size={19} color="var(--primary-600)" /><div><h3>Simulasi Pesan</h3><p>Pesan hanya dicatat di halaman ini dan tidak dikirim.</p></div></div>
          <div className="wa-compose-form">
            <div className="field"><label htmlFor="wa-student">Pilih siswa</label><select id="wa-student" value={studentId} onChange={(event) => { setStudentId(event.target.value); setFeedback(''); }}>
              {data.students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.nis}</option>)}
            </select></div>
            <div className="field"><label htmlFor="wa-template">Template pesan</label><select id="wa-template" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              {data.waTemplates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select></div>
            <div className="wa-recipient"><span>Nomor tujuan (fiktif)</span><strong>{selectedStudent?.parentWhatsapp || 'Tidak tersedia'}</strong></div>
            <div className="wa-preview"><div className="wa-preview-heading">Pratinjau · Simulasi</div><p>{preview || 'Belum ada isi template.'}</p></div>
            <button className="button button-primary" type="button" disabled={!selectedStudent || !template || !selectedStudent.parentWhatsapp} onClick={handleSend}><Send size={16} /> Kirim Simulasi</button>
          </div>
        </section>

        <section className="content-card wa-templates-card">
          <div className="section-title-row"><h3>Template Pesan</h3><span className="status-badge neutral">Semua Simulasi</span></div>
          <div className="wa-template-list">{data.waTemplates.map((item) => <article className="wa-template" key={item.id}>
            <div><strong>{item.name}</strong><span>{item.status}</span></div><button className="icon-button" aria-label={`Edit ${item.name}`} onClick={() => { setFeedback(''); setEditingTemplate(item); }}><Pencil size={16} /></button>
          </article>)}{!data.waTemplates.length && <p className="table-empty">Belum ada template.</p>}</div>
          <p className="wa-hint">Variabel template: <code>{'{nama}'}</code>, <code>{'{periode}'}</code>, <code>{'{nominal}'}</code>, <code>{'{sisa}'}</code>.</p>
        </section>
      </div>

      <section className="table-card wa-log-card">
        <div className="section-title-row"><div><h3>Log Pesan</h3><span className="cell-secondary">Setiap status mencantumkan kata Simulasi.</span></div><span className="status-badge neutral">{data.waMessages.length} catatan</span></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Waktu</th><th>Siswa</th><th>Nomor tujuan</th><th>Template</th><th>Status</th><th>Isi pesan</th></tr></thead>
          <tbody>{data.waMessages.map((message) => <tr key={message.id}><td>{formatDate(message.createdAt)}</td><td>{studentById[message.studentId]?.name || 'Siswa'}</td><td>{message.recipient}</td><td>{message.templateName}</td><td><span className="status-badge">{message.status}</span></td><td><span className="wa-log-body">{message.body}</span></td></tr>)}
            {!data.waMessages.length && <tr><td className="table-empty" colSpan="6">Belum ada simulasi pesan. Pilih siswa dan gunakan tombol Kirim Simulasi.</td></tr>}</tbody>
        </table></div>
        <div className="table-caption">Catatan status ini bukan bukti pesan terkirim melalui WhatsApp.</div>
      </section>
      {editingTemplate && <EntityDialog title="Edit Template Simulasi" initialValue={editingTemplate} fields={[{ name: 'name', label: 'Nama template' }, { name: 'body', label: 'Isi pesan', type: 'textarea', rows: 6, help: 'Gunakan variabel yang tersedia untuk mengisi detail demo.' }]} onSave={handleTemplateSave} onClose={() => setEditingTemplate(null)} />}
    </div>
  );
}
