// ── Avatar ──────────────────────────────────────────────────
const COLORS = ['#0d6efd','#6610f2','#198754','#fd7e14','#dc3545','#0dcaf0','#6f42c1']
export function Avatar({ name = '', size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  const color = COLORS[name.charCodeAt(0) % COLORS.length]
  return (
    <div className="sms-avatar flex-shrink-0"
         style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

// ── StatusBadge ──────────────────────────────────────────────
const SC = { ACTIVE:'success', INACTIVE:'secondary', PENDING:'warning', AT_RISK:'danger',
             PRESENT:'success', ABSENT:'danger', LATE:'warning', PAID:'success',
             OVERDUE:'danger', ON_LEAVE:'warning' }
export function StatusBadge({ status }) {
  const c = SC[status] ?? 'secondary'
  return <span className={`badge bg-${c} bg-opacity-15 text-${c} border border-${c} border-opacity-25`}
               style={{ fontSize:'11px', fontWeight:600 }}>{status?.replace('_',' ')}</span>
}

// ── GradeBadge ───────────────────────────────────────────────
const GC = { 'A+':'success','A':'success','B+':'primary','B':'primary','C+':'warning','C':'warning','D':'danger','F':'danger' }
export function GradeBadge({ grade }) {
  const c = GC[grade] ?? 'secondary'
  return <span className={`badge bg-${c} bg-opacity-15 text-${c}`}
               style={{ fontSize:'12px', fontWeight:700, minWidth:32 }}>{grade}</span>
}

// ── StatCard ─────────────────────────────────────────────────
export function StatCard({ title, value, icon, color='primary', trend, trendUp, sub }) {
  return (
    <div className="sms-card sms-card-hover card h-100">
      <div className="card-body p-3">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <span className="text-muted fw-semibold" style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'.06em' }}>{title}</span>
          <div className={`rounded-3 d-flex align-items-center justify-content-center bg-${color} bg-opacity-10`} style={{ width:38, height:38 }}>
            <i className={`bi ${icon} text-${color}`} style={{ fontSize:'16px' }}></i>
          </div>
        </div>
        <div className={`fw-bold text-${color} mb-1`} style={{ fontSize:'28px', lineHeight:1 }}>{value}</div>
        {(trend||sub) && (
          <div className="text-muted" style={{ fontSize:'12px' }}>
            {trend && <span className={`me-1 fw-semibold ${trendUp?'text-success':'text-danger'}`}><i className={`bi bi-arrow-${trendUp?'up':'down'}`}></i> {trend}</span>}
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

// ── DataTable ────────────────────────────────────────────────
export function DataTable({ columns, data=[], onRowClick, loading, empty='No data found' }) {
  const rows = Array.isArray(data) ? data : []
  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2"></div>Loading…</div>
  if (!rows.length) return <div className="text-center py-5 text-muted"><i className="bi bi-inbox fs-3 d-block mb-2"></i>{empty}</div>
  return (
    <div className="table-responsive">
      <table className="table sms-table align-middle mb-0">
        <thead><tr>{columns.map(c => <th key={c.key} style={c.style}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id??i} onClick={() => onRowClick?.(row)}>
              {columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── PageHeader ───────────────────────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div className="d-flex align-items-start justify-content-between mb-4">
      <div>
        <h5 className="fw-bold mb-0">{title}</h5>
        {sub && <p className="text-muted mb-0" style={{ fontSize:'13px' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── ModalForm (generic) ──────────────────────────────────────
export function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null
  return (
    <div className="modal show d-block" style={{ background:'rgba(0,0,0,.4)' }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header"><h6 className="modal-title">{title}</h6></div>
          <div className="modal-body"><p style={{ fontSize:'14px' }}>{message}</p></div>
          <div className="modal-footer">
            <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-sm btn-danger" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
