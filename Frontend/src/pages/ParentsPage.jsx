// ============================================================
//  src/pages/ParentsPage.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { DataTable, Avatar, PageHeader, ConfirmModal } from '../components/ui'
import { parentsAPI, studentsAPI, usersAPI } from '../services/api' // تأكد من استيراد usersAPI
import { getFullName, getApiErrorMessage, ROLES } from '../utils/helpers'

const PARENT_ROLE_ID = 4

const EMPTY_PARENT_FORM = {
  firstName: '',
  lastName:  '',
  phone:     '',
  email:     '',
  password:  '',
}

export default function ParentsPage() {
  const [parents,      setParents]      = useState([])
  const [students,     setStudents]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form,         setForm]         = useState(EMPTY_PARENT_FORM)
  const [deleteId,     setDeleteId]     = useState(null)

  const [showLinkModal,     setShowLinkModal]    = useState(false)
  const [linkParentId,      setLinkParentId]     = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [linkLoading,       setLinkLoading]      = useState(false)

  const fetchParents = async () => {
    try {
      setLoading(true)
      const [parentsRes, studentsRes] = await Promise.all([
        parentsAPI.getAll(),
        studentsAPI.getAll(),
      ])

      const rawParents = Array.isArray(parentsRes.data) ? parentsRes.data : []

      const detailedParents = await Promise.all(
        rawParents.map(async (parent) => {
          try {

            const userDetailRes = await usersAPI.getById(parent.id)
            return {
              ...parent,
              phone: userDetailRes.data?.phone || 'No Phone' 
            }
          } catch (err) {
            console.error(`Failed to fetch details for parent ${parent.id}`, err)
            return { ...parent, phone: 'N/A' } 
          }
        })
      )

      setParents(detailedParents)
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load parents.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchParents() }, [])

  const filteredParents = parents.filter(parent =>
    getFullName(parent).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddModal = () => {
    setForm(EMPTY_PARENT_FORM)
    setShowAddModal(true)
  }

  const handleSave = async () => {
    if (!form.firstName.trim()) return
    setError('')
    try {
      await parentsAPI.create({
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone,
        email:     form.email,
        password:  form.password || '12345678',
        roleId:    PARENT_ROLE_ID,
        perantId:  0,
      })
      setShowAddModal(false)
      fetchParents()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save parent.'))
    }
  }

  const handleDelete = async () => {
    try {
      await parentsAPI.delete(deleteId)
      setDeleteId(null)
      fetchParents()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete parent.'))
      setDeleteId(null)
    }
  }

  const openLinkModal = (parentId) => {
    setLinkParentId(parentId)
    setSelectedStudentId('')
    setShowLinkModal(true)
  }

  const handleLinkStudent = async () => {
    if (!selectedStudentId || !linkParentId) return
    setLinkLoading(true)
    setError('')
    try {
      await studentsAPI.linkParent(selectedStudentId, linkParentId)
      setShowLinkModal(false)
      fetchParents()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to link student.'))
    } finally {
      setLinkLoading(false)
    }
  }

  const tableColumns = [
    {
      key: 'firstName',
      label: 'Parent',
      render: (_, parent) => (
        <div className="d-flex align-items-center gap-2">
          <Avatar name={getFullName(parent)} size={32} />
          <div>
            <div className="fw-semibold" style={{ fontSize: '13px' }}>
              {getFullName(parent)}
            </div>
            <div className="text-muted" style={{ fontSize: '11px' }}>{parent.email}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'phone', 
      label: 'Phone',
      render: (phone) => (
        <span style={{ fontSize: '12px' }}>
          <i className="bi bi-telephone me-1 text-muted"></i>
          {phone || 'N/A'}
        </span>
      )
    },
    {
      key: 'students',
      label: 'Linked Students',
      render: (linkedStudents) =>
        Array.isArray(linkedStudents) && linkedStudents.length > 0
          ? linkedStudents.map(s => getFullName(s)).join(', ')
          : <span className="text-muted" style={{ fontSize: '12px' }}>No students linked</span>,
    },
    {
      key: 'id',
      label: '',
      style: { width: 120 },
      render: (_, parent) => (
        <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => openLinkModal(parent.id)}
            title="Link a student"
          >
            <i className="bi bi-person-plus"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => setDeleteId(parent.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ]

  const formFields = [
    { key: 'firstName', label: 'First Name', type: 'text',     placeholder: 'Ahmed' },
    { key: 'lastName',  label: 'Last Name',  type: 'text',     placeholder: 'Ali' },
    { key: 'phone',     label: 'Phone',      type: 'text',     placeholder: '01XXXXXXXXX' },
    { key: 'email',     label: 'Email',      type: 'email',    placeholder: 'ahmed@mail.com' },
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
        title="Parents"
        sub={`${filteredParents.length} parents`}
        action={
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <i className="bi bi-plus-lg me-1"></i>Add Parent
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
          data={filteredParents}
          empty="No parents found"
        />
      </div>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '16px' }}>Add Parent</Modal.Title>
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
          <Button variant="outline-secondary" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>Add Parent</Button>
        </Modal.Footer>
      </Modal>

      {/* Link Student Modal */}
      <Modal show={showLinkModal} onHide={() => setShowLinkModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '16px' }}>Link Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Student</Form.Label>
          <Form.Select
            size="sm"
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
          >
            <option value="">Select a student...</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {getFullName(student)} — Grade {student.gradeLevel}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowLinkModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleLinkStudent} disabled={!selectedStudentId || linkLoading}>
            {linkLoading ? 'Linking...' : 'Link Student'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!deleteId}
        title="Delete Parent"
        message="Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}