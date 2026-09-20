import { useState } from 'react'
import { useResource } from '../lib/hooks'
import { api } from '../lib/api'
import { Dialog, Button, Icon, ErrorState, Loading } from './ui'

export default function SafetyDialog({ safety, onClose }) {
  const contact = useResource('/safety/contact')
  const phone = (contact.data?.phone || '').replace(/[^+\d]/g, '')
  const cleanPhone = phone.replace(/^0+/, '').replace(/^\+?91/, '')
  const waPhone = cleanPhone ? `91${cleanPhone}` : ''

  const [sendingAlert, setSendingAlert] = useState(false)
  const [alertStatus, setAlertStatus] = useState(null)

  const contactName = contact.data?.name || 'Trusted Contact'
  const prefilledMessage = encodeURIComponent(
    `Hey ${contactName}, I am going through a really difficult moment right now and could really use someone to talk to. Are you free to talk?`,
  )

  async function handleSendFast2SMS() {
    setSendingAlert(true)
    setAlertStatus(null)
    try {
      const res = await api('/safety/notify', {
        method: 'POST',
        body: {},
      })
      if (res.success) {
        setAlertStatus({ type: 'success', text: `SMS alert sent to ${contactName} via Fast2SMS!` })
      } else {
        setAlertStatus({ type: 'info', text: res.message || 'Fast2SMS alert was logged.' })
      }
    } catch (e) {
      setAlertStatus({ type: 'error', text: e.message || 'Could not send SMS alert.' })
    } finally {
      setSendingAlert(false)
    }
  }

  return (
    <Dialog title="You deserve support." onClose={onClose}>
      <div className="safety-content">
        <span className="support-icon">
          <Icon name="shield" size={32} />
        </span>
        <p>
          {safety.guidance ||
            'If things feel difficult, reaching out to a trusted person or a professional can be a useful next step.'}
        </p>
        <p className="quiet-note">
          Automated text checks can miss or misread distress. They are not a
          clinical assessment. If you may be in immediate danger, contact local
          emergency services.
        </p>
        <div className="support-links">
          <a href="tel:112">
            <b>Emergency help in India</b>
            <span>Call 112 ↗</span>
          </a>
          <a href="tel:14416">
            <b>Tele-MANAS · India</b>
            <span>Call 14416 ↗</span>
          </a>
          <a href="https://findahelpline.com/" target="_blank" rel="noreferrer">
            <b>Outside India?</b>
            <span>Find local support ↗</span>
          </a>
        </div>
        {contact.loading ? (
          <Loading />
        ) : contact.error ? (
          <ErrorState error={contact.error} retry={contact.reload} />
        ) : contact.data ? (
          <div className="trusted-card">
            <h3>{contact.data.name}</h3>
            <p style={{ margin: '4px 0 12px', fontSize: '14px', color: 'var(--muted)' }}>
              Your saved trusted contact ({contact.data.relationship_type || 'Support'})
            </p>
            <div className="trusted-actions">
              <a className="btn btn-secondary" href={`tel:${phone}`} style={{ width: '100%', textAlign: 'center' }}>
                📞 Call {phone}
              </a>
              <div className="trusted-actions-row">
                <a
                  className="btn-whatsapp"
                  href={`https://wa.me/${waPhone}?text=${prefilledMessage}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  💬 WhatsApp
                </a>
                <a
                  className="btn-sms"
                  href={`sms:${phone}?body=${prefilledMessage}`}
                >
                  ✉️ Send SMS
                </a>
              </div>
              <Button
                variant="primary"
                disabled={sendingAlert}
                onClick={handleSendFast2SMS}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {sendingAlert ? 'Sending Fast2SMS…' : '⚡ Send Fast2SMS Alert to Friend'}
              </Button>
            </div>
            {alertStatus && (
              <p
                role="status"
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background:
                    alertStatus.type === 'success'
                      ? '#dcfce7'
                      : alertStatus.type === 'error'
                      ? '#fee2e2'
                      : '#f1f5f9',
                  color:
                    alertStatus.type === 'success'
                      ? '#166534'
                      : alertStatus.type === 'error'
                      ? '#991b1b'
                      : '#334155',
                }}
              >
                {alertStatus.text}
              </p>
            )}
            <p className="quiet-note" style={{ marginTop: '10px' }}>
              Choose your preferred way to reach out. Fast2SMS delivers a direct privacy-preserving emergency SMS alert to your contact's mobile phone.
            </p>
          </div>
        ) : (
          <p>No trusted contact is saved. You can add one in Settings.</p>
        )}
        <Button variant="secondary" onClick={onClose}>
          Close support options
        </Button>
      </div>
    </Dialog>
  )
}

