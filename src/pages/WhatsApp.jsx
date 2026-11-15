import React, { useMemo, useState } from 'react';
import { CheckCheck, Clock3, MessageCircle, MessageSquare, Pencil, Search, Send, ShieldCheck, Smartphone } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Feedback from '../components/ui/Feedback';
import EntityDialog from '../components/ui/EntityDialog';
import { useData } from '../app/DataProvider';
import { formatDate, formatPeriod, formatRupiah, getInvoiceBalance } from '../utils/formatters';

export default function WhatsApp() {
  const { data, saveTemplate, sendWhatsAppSimulation } = useData();
  const [studentId, setStudentId] = useState(data.students[0]?.id || '');
  const [templateId, setTemplateId] = useState(data.waTemplates[0]?.id || '');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedMessage, setExpandedMessage] = useState('');
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
  const filteredMessages = data.waMessages.filter((message) => {
    const student = studentById[message.studentId];
    const matchesQuery = `${student?.name || ''} ${student?.nis || ''} ${message.recipient} ${message.templateName} ${message.body}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!typeFilter || message.templateId === typeFilter) && (!statusFilter || message.status === statusFilter);
  });
  const handleSend = () => {
    if (!selectedStudent || !template || !selectedStudent.parentWhatsapp) return;
    sendWhatsAppSimulation({ studentId, templateId, templateName: template.name, recipient: selectedStudent.parentWhatsapp, body: preview });
    setFeedback(`Status Terkirim (Simulasi) dicatat untuk ${selectedStudent.name}. Tidak ada pesan sungguhan yang dikirim.`);
  };
  const handleTemplateSave = (formValues) => {
    saveTemplate({ ...editingTemplate, name: formValues.name.trim(), body: formValues.body.trim() });
    setEditingTemplate(null);
    setFeedback('Template simulasi berhasil diperbarui.');
  };

  return (
    <div className="whatsapp-page">
      <PageHeader title="WhatsApp Gateway" description="Kelola pratinjau template dan catatan pesan WhatsApp dalam mode simulasi." />
      <Feedback message={feedback} />

      <section className="wa-gateway-banner" aria-label="Status koneksi WhatsApp">
        <div className="wa-gateway-brand"><span className="wa-brand-icon"><MessageCircle size={21} /></span><div><strong>MA Darul Ihya</strong><span>WhatsApp Gateway · Mode Simulasi</span></div></div>
        <div className="wa-connection-state"><span className="wa-live-dot" /> Tidak terhubung ke provider</div>
      </section>

      <section className="wa-summary-grid" aria-label="Ringkasan simulasi">
        <article className="metric-card"><div className="wa-stat-icon"><ShieldCheck size={18} /></div><span className="metric-label">Mode gateway</span><strong className="metric-value">Simulasi</strong><span className="metric-note">Tidak ada pengiriman nyata</span></article>
        <article className="metric-card"><div className="wa-stat-icon"><MessageSquare size={18} /></div><span className="metric-label">Template pesan</span><strong className="metric-value">{data.waTemplates.length}</strong><span className="metric-note">Template lokal tersedia</span></article>
        <article className="metric-card"><div className="wa-stat-icon"><CheckCheck size={18} /></div><span className="metric-label">Catatan berhasil</span><strong className="metric-value">{succeeded}</strong><span className="metric-note">Status berhasil (Simulasi)</span></article>
        <article className="metric-card"><div className="wa-stat-icon"><Clock3 size={18} /></div><span className="metric-label">Total log pesan</span><strong className="metric-value">{data.waMessages.length}</strong><span className="metric-note">Tersimpan di data demo</span></article>
      </section>

      <div className="wa-redesign-grid">
        <section className="content-card wa-compose-card">
          <div className="wa-section-heading"><div className="wa-section-icon"><Send size={17} /></div><div><h3>Simulasi pesan</h3><p>Pilih penerima dan template untuk melihat pratinjau pesan.</p></div></div>
          <div className="wa-compose-form">
            <div className="field"><label htmlFor="wa-student">Pilih siswa</label><select id="wa-student" value={studentId} onChange={(event) => { setStudentId(event.target.value); setFeedback(''); }}>
              {data.students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.nis}</option>)}
            </select></div>
            <div className="field"><label htmlFor="wa-template">Jenis notifikasi / template</label><select id="wa-template" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              {data.waTemplates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select></div>
            <div className="wa-recipient"><span><Smartphone size={15} /> Nomor tujuan (fiktif)</span><strong>{selectedStudent?.parentWhatsapp || 'Tidak tersedia'}</strong></div>
            <div className="wa-chat-preview" aria-label="Pratinjau pesan simulasi">
              <div className="wa-chat-top"><span className="wa-chat-avatar">DI</span><div><strong>MA Darul Ihya</strong><span>Pratinjau · Simulasi</span></div><span className="wa-chat-status">SIMULASI</span></div>
              <div className="wa-chat-body"><span className="wa-today">PRATINJAU PESAN</span><div className="wa-chat-bubble"><p>{preview || 'Belum ada isi template.'}</p><div className="wa-chat-time">Pratinjau <CheckCheck size={14} /></div></div><div className="wa-chat-disclaimer">Tampilan pratinjau saja. Pesan tidak dikirim ke WhatsApp.</div></div>
            </div>
            <button className="button button-primary wa-send-button" type="button" disabled={!selectedStudent || !template || !selectedStudent.parentWhatsapp} onClick={handleSend}><Send size={16} /> Catat Kirim Simulasi</button>
          </div>
        </section>

        <section className="content-card wa-templates-card">
          <div className="wa-section-heading"><div className="wa-section-icon"><MessageSquare size={17} /></div><div><h3>Template notifikasi</h3><p>Pesan yang tersedia untuk alur demo.</p></div></div>
          <div className="wa-template-list">{data.waTemplates.map((item) => <article className="wa-template" key={item.id}>
            <div className="wa-template-copy"><strong>{item.name}</strong><span><span className="wa-template-dot" />{item.status}</span><p>{item.body}</p></div><button className="icon-button" aria-label={`Edit ${item.name}`} onClick={() => { setFeedback(''); setEditingTemplate(item); }}><Pencil size={16} /></button>
          </article>)}{!data.waTemplates.length && <p className="table-empty">Belum ada template.</p>}</div>
          <p className="wa-hint">Variabel: <code>{'{nama}'}</code>, <code>{'{periode}'}</code>, <code>{'{nominal}'}</code>, <code>{'{sisa}'}</code>.</p>
          <div className="wa-template-notice"><ShieldCheck size={16} /><span>Semua template hanya digunakan untuk pratinjau dan simulasi.</span></div>
        </section>
      </div>

      <section className="table-card wa-log-card">
        <div className="wa-log-heading"><div><h3>Log notifikasi</h3><p>Riwayat aktivitas pesan pada data demo.</p></div><span className="status-badge neutral">{filteredMessages.length} catatan simulasi</span></div>
        <div className="wa-log-toolbar">
          <label className="wa-search"><Search size={17} /><span className="sr-only">Cari log</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, NIS, nomor, atau pesan..." /></label>
          <label className="sr-only" htmlFor="wa-type-filter">Filter jenis notifikasi</label><select id="wa-type-filter" className="filter-control" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">Semua jenis notifikasi</option>{data.waTemplates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <label className="sr-only" htmlFor="wa-status-filter">Filter status simulasi</label><select id="wa-status-filter" className="filter-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Semua status simulasi</option><option value="Terkirim (Simulasi)">Terkirim (Simulasi)</option></select>
        </div>
        <div className="table-scroll"><table className="data-table wa-log-table"><thead><tr><th>Waktu catat</th><th>Siswa &amp; kelas</th><th>Nomor tujuan</th><th>Jenis notifikasi</th><th>Ringkasan pesan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{filteredMessages.map((message) => { const student = studentById[message.studentId]; const klass = data.classes.find((item) => item.id === student?.classId); return <React.Fragment key={message.id}><tr>
            <td><strong>{formatDate(message.createdAt)}</strong><span className="cell-secondary">{new Date(message.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · ID {message.id.slice(-7)}</span></td>
            <td><strong>{student?.name || 'Siswa demo'}</strong><span className="cell-secondary">{klass?.name || 'Kelas tidak tersedia'}{student?.nis ? ` · NIS ${student.nis}` : ''}</span></td>
            <td>{message.recipient}<span className="cell-secondary">Nomor fiktif</span></td><td>{message.templateName}</td><td><span className="wa-log-body">{message.body}</span></td>
            <td><span className="status-badge">{message.status.includes('Simulasi') ? message.status : `${message.status} (Simulasi)`}</span></td>
            <td><button className="table-action" aria-expanded={expandedMessage === message.id} onClick={() => setExpandedMessage(expandedMessage === message.id ? '' : message.id)}>{expandedMessage === message.id ? 'Tutup' : 'Lihat pesan'}</button></td>
          </tr>{expandedMessage === message.id && <tr className="wa-expanded-row"><td colSpan="7"><strong>Isi pesan (Simulasi)</strong><p>{message.body}</p><span>Dicatat di prototipe pada {formatDate(message.createdAt)}. Tidak ada konfirmasi dari provider.</span></td></tr>}</React.Fragment>; })}
            {!filteredMessages.length && <tr><td className="table-empty" colSpan="7">{data.waMessages.length ? 'Tidak ada log yang cocok dengan pencarian atau filter.' : 'Belum ada catatan simulasi. Pilih siswa dan gunakan tombol Catat Kirim Simulasi.'}</td></tr>}</tbody>
        </table></div>
        <div className="table-caption">Status log hanya simulasi dan bukan bukti pesan terkirim, diterima, atau dibaca oleh penerima.</div>
      </section>
      {editingTemplate && <EntityDialog title="Edit Template Simulasi" initialValue={editingTemplate} fields={[{ name: 'name', label: 'Nama template' }, { name: 'body', label: 'Isi pesan', type: 'textarea', rows: 6, help: 'Gunakan variabel yang tersedia untuk mengisi detail demo.' }]} onSave={handleTemplateSave} onClose={() => setEditingTemplate(null)} />}
    </div>
  );
}
