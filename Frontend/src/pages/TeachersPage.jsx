// ============================================================
//  src/pages/TeachersPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { DataTable, Avatar, PageHeader, ConfirmModal } from '../components/ui'
import { instructorsAPI, usersAPI } from '../services/api' // تأكد من استيراد usersAPI
import { getFullName, getApiErrorMessage } from '../utils/helpers'

const TEACHER_ROLE_ID = 3

const EMPTY_TEACHER_FORM = {
  firstName: '',
  lastName:  '',
  phone:     '',
  email:     '',
  password:  '',
  roleId:    TEACHER_ROLE_ID,
}

export default function TeachersPage() {
  const [teachers,    setTeachers]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal,   setShowModal]   = useState(false)
  const [form,         setForm]         = useState(EMPTY_TEACHER_FORM)
  const [deleteId,     setDeleteId]     = useState(null)

  // ── تحسين جلب البيانات لدمج الهاتف والإيميل ──────────────────────
  const fetchTeachers = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. جلب القائمة الأساسية للمدرسين
      const res = await instructorsAPI.getAll()
      const rawTeachers = Array.isArray(res.data) ? res.data : []

      // 2. لعمل طلب منفصل لكل مدرس لجلب بياناته الشخصية (getById)
      const detailedTeachers = await Promise.all(
        rawTeachers.map(async (teacher) => {
          try {
            // نستخدم instructorId لجلب البيانات من usersAPI أو instructorsAPI.getById
            // غالباً البيانات الشخصية (إيميل وتليفون) موجودة في Auth/User service
            const detailRes = await usersAPI.getById(teacher.instructorId)
            return {
              ...teacher,
              // نفضل البيانات القادمة من الـ Detail API
              email: detailRes.data?.email || teacher.email,
              phone: detailRes.data?.phone || teacher.phone || 'N/A'
            }
          } catch (err) {
            console.error(`Error fetching details for teacher ${teacher.instructorId}`, err)
            return { ...teacher, phone: 'N/A' }
          }
        })
      )

      setTeachers(detailedTeachers)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load teachers.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTeachers() }, [])

  // ── Filtering ──────────────────────────────────────────────
  const filteredTeachers = teachers.filter(t =>
    getFullName(t).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateModal = () => { setForm(EMPTY_TEACHER_FORM); setShowModal(true) }
  const closeModal       = () => setShowModal(false)

  const handleSave = async () => {
    if (!form.firstName.trim()) return
    setError('')
    try {
      await instructorsAPI.create({
        firstName:    form.firstName,
        lastName:     form.lastName,
        phone:        form.phone,
        email:        form.email,
        password:     form.password || '12345678',
        roleId:       TEACHER_ROLE_ID,
        instructorId: 0,
      })
      closeModal()
      fetchTeachers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save teacher.'))
    }
  }

  const handleDelete = async () => {
    try {
      await instructorsAPI.delete(deleteId)
      setDeleteId(null)
      fetchTeachers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete teacher.'))
      setDeleteId(null)
    }
  }

  // ── Table columns ──────────────────────────────────────────
  const tableColumns = [
    {
      key: 'firstName',
      label: 'Teacher',
      render: (_, teacher) => (
        <div className="d-flex align-items-center gap-2">
          <Avatar name={getFullName(teacher)} size={32} />
          <div>
            <div className="fw-semibold" style={{ fontSize: '13px' }}>
              {getFullName(teacher)}
            </div>
            <div className="text-muted" style={{ fontSize: '11px' }}>ID: {teacher.instructorId}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (email) => (
        <span style={{ fontSize: '12px' }}>
          <i className="bi bi-envelope me-1 text-muted"></i>
          {email}
        </span>
      )
    },
    { 
      key: 'phone', 
      label: 'Phone',
      render: (phone) => (
        <span style={{ fontSize: '12px' }}>
          <i className="bi bi-telephone me-1 text-muted"></i>
          {phone}
        </span>
      )
    },
    {
      key: 'instructorId',
      label: '',
      style: { width: 60 },
      render: (_, teacher) => (
        <div onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => setDeleteId(teacher.instructorId)}
            title="Delete teacher"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ]

  const formFields = [
    { key: 'firstName', label: 'First Name', type: 'text',     placeholder: 'Sara' },
    { key: 'lastName',  label: 'Last Name',  type: 'text',     placeholder: 'Kamal' },
    { key: 'phone',     label: 'Phone',      type: 'text',     placeholder: '01XXXXXXXXX' },
    { key: 'email',     label: 'Email',      type: 'email',    placeholder: 'sara@school.edu' },
    { key: 'password',  label: 'Password',   type: 'password', placeholder: 'Min 8 chars' },
  ]

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Teachers"
        sub={`${filteredTeachers.length} teacher${filteredTeachers.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <i className="bi bi-plus-lg me-1"></i>Add Teacher
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="sms-card card p-3 mb-3">
        <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sms-card card p-3">
        <DataTable
          columns={tableColumns}
          data={filteredTeachers}
          empty="No teachers found"
        />
      </div>

      {/* Add Teacher Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '16px' }}>Add Teacher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            {formFields.map(({ key, label, type, placeholder }) => (
              <div className="col-12 col-md-6" key={key}>
                <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>{label}</Form.Label>
                <Form.Control
                  size="sm"
                  type={type}
                  placeholder={placeholder}
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>Add Teacher</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!deleteId}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}