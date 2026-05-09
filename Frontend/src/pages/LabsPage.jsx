// ============================================================
//  src/pages/LabsPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { DataTable, PageHeader, ConfirmModal } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { labsAPI, coursesAPI, enrollmentsAPI } from '../services/api'
import { getApiErrorMessage, ROLES } from '../utils/helpers'

const EMPTY_FORM = { className: '' }

export default function LabsPage() {
  const { user, hasRole } = useAuth()

  const [labs,        setLabs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state (admin only)
  const [showModal,  setShowModal]  = useState(false)
  const [editingLab, setEditingLab] = useState(null)   // null = create, object = edit
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)

  // Delete confirm (admin only)
  const [deleteId, setDeleteId] = useState(null)

  // ── Data fetching ──────────────────────────────────────────
  const fetchLabs = async () => {
    setLoading(true)
    setError('')
    try {

      // ── ADMIN: fetch all labs directly ────────────────────
      if (hasRole(ROLES.ADMIN)) {
        const res  = await labsAPI.getAll()
        setLabs(Array.isArray(res.data) ? res.data : [])
        return
      }

      // ── INSTRUCTOR: labs from his courses only ────────────
      if (hasRole(ROLES.TEACHER)) {
        const coursesRes = await coursesAPI.getByInstructorId(user.id)
        const myCourses  = Array.isArray(coursesRes.data) ? coursesRes.data : []

        // Each course has a `lab` object (or null) from the backend
        const seen   = new Set()
        const myLabs = []
        myCourses.forEach(course => {
          const lab = course.lab
          if (lab && !seen.has(lab.classId)) {
            seen.add(lab.classId)
            myLabs.push({ ...lab, courseNames: [] })
          }
          // Attach course names to the lab for display
          if (lab) {
            const entry = myLabs.find(l => l.classId === lab.classId)
            if (entry) entry.courseNames.push(course.courseName)
          }
        })
        setLabs(myLabs)
        return
      }

      // ── STUDENT: labs from enrolled courses ───────────────
      if (hasRole(ROLES.STUDENT)) {
        const enrollRes  = await enrollmentsAPI.getByStudentId(user.id)
        const enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : []

        const seen   = new Set()
        const myLabs = []
        enrollments.forEach(enrollment => {
          const course = enrollment.course
          const lab    = course?.lab
          if (lab && !seen.has(lab.classId)) {
            seen.add(lab.classId)
            myLabs.push({ ...lab, courseNames: [] })
          }
          if (lab) {
            const entry = myLabs.find(l => l.classId === lab.classId)
            if (entry) entry.courseNames.push(course.courseName)
          }
        })
        setLabs(myLabs)
        return
      }

    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load labs. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLabs() }, [])

  // ── Filtering ──────────────────────────────────────────────
  const filtered = labs.filter(lab =>
    (lab.className || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Modal helpers (admin) ──────────────────────────────────
  const openCreate = () => {
    setEditingLab(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (lab) => {
    setEditingLab(lab)
    setForm({ className: lab.className || '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLab(null)
    setForm(EMPTY_FORM)
  }

  // ── Save (create or update) ────────────────────────────────
  const handleSave = async () => {
    if (!form.className.trim()) return
    setSaving(true)
    setError('')
    try {
      if (editingLab) {
        await labsAPI.update(editingLab.classId, { className: form.className })
      } else {
        await labsAPI.create({ className: form.className })
      }
      closeModal()
      fetchLabs()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save lab. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await labsAPI.delete(deleteId)
      setDeleteId(null)
      fetchLabs()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete lab. Please try again.'))
      setDeleteId(null)
    }
  }

  // ── Table columns ──────────────────────────────────────────
  const columns = [
    {
      key: 'classId',
      label: 'Lab ID',
      style: { width: 80 },
      render: (val) => (
        <span className="badge bg-secondary" style={{ fontWeight: 500 }}>#{val}</span>
      ),
    },
    {
      key: 'className',
      label: 'Lab Name',
      render: (val) => (
        <div className="d-flex align-items-center gap-2">
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(13,110,253,.12)', color: '#0d6efd', fontSize: 16,
          }}>
            <i className="bi bi-pc-display-horizontal"></i>
          </span>
          <span className="fw-semibold" style={{ fontSize: '13px' }}>{val}</span>
        </div>
      ),
    },
    // Show courses column for instructor & student
    ...(!hasRole(ROLES.ADMIN) ? [{
      key: 'courseNames',
      label: 'Used in Courses',
      render: (val) => (
        <div className="d-flex flex-wrap gap-1">
          {(val || []).map((name, i) => (
            <span key={i} className="badge bg-primary bg-opacity-10 text-primary"
                  style={{ fontWeight: 500, fontSize: '11px' }}>{name}</span>
          ))}
        </div>
      ),
    }] : []),
    // Actions (admin only)
    ...(hasRole(ROLES.ADMIN) ? [{
      key: 'classId',
      label: '',
      style: { width: 100 },
      render: (val, lab) => (
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => openEdit(lab)}
            title="Edit lab"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => setDeleteId(val)}
            title="Delete lab"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    }] : []),
  ]

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  const pageSubtitle = hasRole(ROLES.ADMIN)
    ? `${filtered.length} lab${filtered.length !== 1 ? 's' : ''} total`
    : hasRole(ROLES.TEACHER)
    ? 'Labs assigned to your courses'
    : 'Your course labs'

  return (
    <div>
      <PageHeader
        title="Labs"
        sub={pageSubtitle}
        action={
          hasRole(ROLES.ADMIN) ? (
            <button className="btn btn-primary btn-sm" onClick={openCreate}>
              <i className="bi bi-plus-lg me-1"></i>Add Lab
            </button>
          ) : null
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Search bar */}
      <div className="sms-card card p-3 mb-3">
        <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by lab name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="sms-card card p-3">
        <DataTable
          columns={columns}
          data={filtered}
          empty={
            hasRole(ROLES.ADMIN)
              ? 'No labs found. Click "Add Lab" to create one.'
              : hasRole(ROLES.TEACHER)
              ? 'No labs are assigned to your courses yet.'
              : 'No labs found for your enrolled courses.'
          }
        />
      </div>

      {/* Add / Edit Modal (admin only) */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '16px' }}>
            {editingLab ? 'Edit Lab' : 'Add New Lab'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>
              Lab Name
            </Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="e.g. Computer Lab A, Chemistry Lab 2"
              value={form.className}
              onChange={e => setForm({ className: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || !form.className.trim()}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving…</>
              : editingLab ? 'Save Changes' : 'Add Lab'
            }
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        show={!!deleteId}
        title="Delete Lab"
        message="Are you sure you want to delete this lab? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}