import { useEffect, useState } from 'react'
import './App.css'

const stages = [
  'Authentication',
  'Alert Intelligence',
  'Serving Cell / Region',
  'Language Processing',
  'Audio Preparation',
  'Alert Packaging',
  'Last-Mile Delivery',
  'Citizen Response',
]

const regionData = {
  'WB-KOL-042': {
    state: 'West Bengal',
    district: 'Kolkata',
    language: 'Bengali',
    languageCode: 'bn-IN',
  },
  'OD-BBS-019': {
    state: 'Odisha',
    district: 'Bhubaneswar',
    language: 'Odia',
    languageCode: 'or-IN',
  },
  'TN-CHE-011': {
    state: 'Tamil Nadu',
    district: 'Chennai',
    language: 'Tamil',
    languageCode: 'ta-IN',
  },
  'MH-MUM-031': {
    state: 'Maharashtra',
    district: 'Mumbai',
    language: 'Marathi',
    languageCode: 'mr-IN',
  },
}

const initialRecipients = [
  {
    id: 'U001',
    name: 'Citizen 001',
    delivery: 'SENT',
    read: 'NOT_READ',
    acknowledgement: 'PENDING',
  },
  {
    id: 'U002',
    name: 'Citizen 002',
    delivery: 'RECEIVED',
    read: 'READ',
    acknowledgement: 'NO ISSUE',
  },
  {
    id: 'U003',
    name: 'Citizen 003',
    delivery: 'NOT_RECEIVED',
    read: '—',
    acknowledgement: 'PENDING',
  },
  {
    id: 'U004',
    name: 'Citizen 004',
    delivery: 'RECEIVED',
    read: 'READ',
    acknowledgement: 'NEED HELP',
  },
  {
    id: 'U005',
    name: 'Citizen 005',
    delivery: 'RECEIVED',
    read: 'READ',
    acknowledgement: 'PENDING',
  },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const [alertStatus, setAlertStatus] = useState('WAITING')
  const [processing, setProcessing] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [alertReceived, setAlertReceived] = useState(false)

  const [selectedCell, setSelectedCell] = useState('WB-KOL-042')

  const [recipients, setRecipients] = useState(initialRecipients)

  const [acknowledgement, setAcknowledgement] = useState('PENDING')

  const [reminderCount, setReminderCount] = useState(0)
  const [reminderActive, setReminderActive] = useState(false)

  const [networkStatus, setNetworkStatus] = useState(
    'ALL CHANNELS AVAILABLE',
  )

  const [eventLog, setEventLog] = useState([
    'System initialized.',
    'Waiting for official government alert input.',
  ])

  const [audioPlaying, setAudioPlaying] = useState(false)

  const region = regionData[selectedCell]

  const addLog = (message) => {
    setEventLog((previous) => [
      `${new Date().toLocaleTimeString()} — ${message}`,
      ...previous,
    ])
  }

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  /*
   * ---------------------------------------------------------
   * INPUT OFFICIAL ALERT
   * ---------------------------------------------------------
   */

  const startAlertProcessing = async () => {
    if (processing) return

    setProcessing(true)
    setAlertReceived(false)
    setAlertStatus('PROCESSING')
    setCurrentStage(0)
    setAcknowledgement('PENDING')
    setReminderCount(0)
    setReminderActive(false)

    addLog('Official government alert received by system.')

    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(i + 1)

      if (i === 0) {
        addLog('Authenticating authorised government source.')
      }

      if (i === 1) {
        addLog('Alert Intelligence analysing emergency information.')
      }

      if (i === 2) {
        addLog(
          `Serving cell ${selectedCell} mapped to ${region.state}.`,
        )
      }

      if (i === 3) {
        addLog(
          `Preparing English + Hindi + ${region.language}.`,
        )
      }

      if (i === 4) {
        addLog('Preparing short multilingual emergency audio.')
      }

      if (i === 5) {
        addLog('Packaging critical message and safety information.')
      }

      if (i === 6) {
        addLog(
          'Selecting cellular + internet + wired relay channels.',
        )
      }

      if (i === 7) {
        addLog('Emergency alert delivered to citizen devices.')
      }

      await sleep(1100)
    }

    setAlertStatus('VERIFIED')
    setNetworkStatus('ALL CHANNELS AVAILABLE')
    setAlertReceived(true)
    setProcessing(false)

    setRecipients((previous) =>
      previous.map((recipient, index) =>
        index === 0
          ? {
              ...recipient,
              delivery: 'RECEIVED',
              read: 'READ',
            }
          : recipient,
      ),
    )

    addLog('ALERT DELIVERED — citizen response is now active.')

    setActivePage('people')
  }

  /*
   * ---------------------------------------------------------
   * AUTOMATIC AUDIO
   * ---------------------------------------------------------
   */

  const playAudioSequence = () => {
    if (!alertReceived) return

    if (!('speechSynthesis' in window)) {
      addLog('Browser speech synthesis is unavailable.')
      return
    }

    window.speechSynthesis.cancel()

    const messages = [
      {
        language: 'English',
        text: 'Flood warning. Move to higher ground immediately.',
        voice: 'en-IN',
      },
      {
        language: 'Hindi',
        text: 'बाढ़ की चेतावनी। तुरंत ऊँचे स्थान पर जाएँ।',
        voice: 'hi-IN',
      },
      {
        language: region.language,
        text:
          region.language === 'Bengali'
            ? 'বন্যার সতর্কতা। অবিলম্বে উঁচু জায়গায় চলে যান।'
            : region.language === 'Odia'
              ? 'ବନ୍ୟା ସତର୍କତା। ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।'
              : region.language === 'Tamil'
                ? 'வெள்ள எச்சரிக்கை. உடனடியாக உயரமான இடத்திற்கு செல்லுங்கள்.'
                : region.language === 'Marathi'
                  ? 'पूराचा इशारा. त्वरित उंच ठिकाणी जा.'
                  : 'Flood warning. Move to higher ground immediately.',
        voice: region.languageCode,
      },
    ]

    let index = 0

    setAudioPlaying(true)

    const speakNext = () => {
      if (index >= messages.length) {
        setAudioPlaying(false)
        return
      }

      const message = messages[index]

      const utterance = new SpeechSynthesisUtterance(
        message.text,
      )

      utterance.lang = message.voice
      utterance.rate = 0.85
      utterance.pitch = 1

      utterance.onend = () => {
        index += 1
        speakNext()
      }

      utterance.onerror = () => {
        index += 1
        speakNext()
      }

      window.speechSynthesis.speak(utterance)
    }

    speakNext()
  }

  /*
   * Automatically play once after alert delivery.
   */

  useEffect(() => {
    if (!alertReceived) return

    const timer = setTimeout(() => {
      playAudioSequence()
    }, 500)

    return () => clearTimeout(timer)
  }, [alertReceived])

  /*
   * ---------------------------------------------------------
   * ACKNOWLEDGEMENT
   * ---------------------------------------------------------
   */

  const submitAcknowledgement = (value) => {
    setAcknowledgement(value)
    setReminderActive(false)

    setRecipients((previous) =>
      previous.map((recipient, index) =>
        index === 0
          ? {
              ...recipient,
              acknowledgement: value,
              delivery: 'RECEIVED',
              read: 'READ',
            }
          : recipient,
      ),
    )

    if (value === 'NO ISSUE') {
      addLog('Citizen acknowledged: NO ISSUE.')
    }

    if (value === 'NEED HELP') {
      addLog(
        'Citizen requested assistance — response coordination notified.',
      )
    }
  }

  /*
   * ---------------------------------------------------------
   * 30 MINUTE REMINDER SIMULATION
   * 30 simulated minutes = 10 real seconds
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!alertReceived) return
    if (acknowledgement !== 'PENDING') return

    setReminderActive(true)

    const interval = setInterval(() => {
      setReminderCount((previous) => previous + 1)

      addLog(
        '30-minute reminder sent because acknowledgement is pending.',
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [alertReceived, acknowledgement])

  /*
   * ---------------------------------------------------------
   * EDGE CASES
   * ---------------------------------------------------------
   */

  const rejectAlert = () => {
    setProcessing(false)
    setAlertReceived(false)
    setAlertStatus('REJECTED')
    setCurrentStage(0)
    addLog(
      'ALERT REJECTED — source is not an authorised government source.',
    )
  }

  const simulateNetworkFailure = () => {
    setNetworkStatus('CELLULAR UNAVAILABLE — INTERNET + WIRED RELAY')
    addLog(
      'Cellular network unavailable. Internet and wired relay activated.',
    )
  }

  const simulateUnknownCell = () => {
    setSelectedCell('UNKNOWN')
    addLog(
      'Serving cell could not be mapped. English + Hindi fallback activated.',
    )
  }

  const simulateAlertUpdate = () => {
    if (!alertReceived) return

    addLog(
      'ALERT UPDATE RECEIVED — latest government alert version supersedes previous information.',
    )
  }

  const simulateCancellation = () => {
    setReminderActive(false)
    setAlertStatus('CANCELLED')

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    addLog(
      'ALERT CANCELLED — reminder mechanism stopped.',
    )
  }

  const simulateAllClear = () => {
    setReminderActive(false)
    setAlertStatus('ALL CLEAR')

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    addLog(
      'OFFICIAL ALL CLEAR received — alert cycle closed.',
    )
  }

  /*
   * ---------------------------------------------------------
   * KPI VALUES
   * ---------------------------------------------------------
   */

  const sentCount = recipients.length

  const receivedCount = recipients.filter(
    (r) => r.delivery === 'RECEIVED',
  ).length

  const readCount = recipients.filter(
    (r) => r.read === 'READ',
  ).length

  const helpCount = recipients.filter(
    (r) => r.acknowledgement === 'NEED HELP',
  ).length

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🚨</div>

          <div>
            <div className="brand-title">
              Last-Mile Emergency Alert System
            </div>

            <div className="brand-subtitle">
              Emergency Warning Delivery & Citizen Response Platform
            </div>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="navigation">

        <button
          className={
            activePage === 'dashboard'
              ? 'nav-button active'
              : 'nav-button'
          }
          onClick={() => setActivePage('dashboard')}
        >
          📊 Dashboard
        </button>

        <button
          className={
            activePage === 'people'
              ? 'nav-button active'
              : 'nav-button'
          }
          onClick={() => setActivePage('people')}
        >
          👥 People View
        </button>

        <button
          className={
            activePage === 'edge'
              ? 'nav-button active'
              : 'nav-button'
          }
          onClick={() => setActivePage('edge')}
        >
          🧪 Edge Cases
        </button>

      </nav>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main">

        {/* ===================================================
            DASHBOARD
        ==================================================== */}

        {activePage === 'dashboard' && (
          <>
            <section className="hero">

              <div className="hero-content">

                <div className="eyebrow">
                  K-1000 • KSAC • HALL A
                </div>

                <h1>
                  Making Emergency Warnings Reach the Last Mile
                </h1>

                <p>
                  From an authenticated government alert to
                  citizen acknowledgement and assistance requests.
                </p>

                {/* MAIN INPUT BUTTON */}

                <button
                  className="input-alert-button"
                  onClick={startAlertProcessing}
                  disabled={processing}
                >
                  {processing
                    ? '⏳ PROCESSING OFFICIAL ALERT...'
                    : '📥 INPUT OFFICIAL ALERT'}
                </button>

              </div>

              <div className="alert-preview">

                <div className="alert-preview-icon">
                  🚨
                </div>

                <div>
                  <div className="alert-level">
                    EXTREME ALERT
                  </div>

                  <div className="alert-action">
                    Take action now
                  </div>
                </div>

              </div>

            </section>

            {/* PROCESSING CARD */}

            {processing && (
              <section className="processing-card">

                <div className="processing-header">

                  <div>
                    <div className="section-label">
                      LIVE PROCESSING
                    </div>

                    <h2>
                      Emergency Alert Pipeline
                    </h2>
                  </div>

                  <span className="processing-badge">
                    ● RUNNING
                  </span>

                </div>

                <div className="processing-progress">
                  <div
                    className="processing-progress-bar"
                    style={{
                      width: `${(currentStage / stages.length) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="processing-stage">

                  {currentStage === 1 &&
                    '🛡️ Authenticating Government Source'}

                  {currentStage === 2 &&
                    '🧠 Analysing Alert'}

                  {currentStage === 3 &&
                    '📍 Identifying Serving Cell / Region'}

                  {currentStage === 4 &&
                    `🌐 Preparing English + Hindi + ${region.language}`}

                  {currentStage === 5 &&
                    '🔊 Preparing Multilingual Audio'}

                  {currentStage === 6 &&
                    '📦 Packaging Emergency Alert'}

                  {currentStage === 7 &&
                    '📡 Selecting Last-Mile Network'}

                  {currentStage === 8 &&
                    '📱 Delivering to Citizens'}

                </div>

              </section>
            )}

            {/* PIPELINE */}

            <section className="pipeline-card">

              <div className="section-heading">
                <div>
                  <div className="section-label">
                    LIVE PIPELINE
                  </div>

                  <h2>
                    Government Alert → Citizen
                  </h2>
                </div>

                <div className="pipeline-status">
                  {alertStatus}
                </div>
              </div>

              <div className="pipeline">

                {stages.map((stage, index) => {

                  const number = index + 1

                  let state = 'waiting'

                  if (number < currentStage) {
                    state = 'done'
                  }

                  if (number === currentStage) {
                    state = 'current'
                  }

                  if (
                    !processing &&
                    alertReceived &&
                    number <= 7
                  ) {
                    state = 'done'
                  }

                  if (
                    !processing &&
                    alertReceived &&
                    number === 8
                  ) {
                    state = 'current'
                  }

                  return (
                    <div
                      className={`pipeline-item ${state}`}
                      key={stage}
                    >

                      <div className="pipeline-number">
                        {state === 'done'
                          ? '✓'
                          : number}
                      </div>

                      <div>
                        <div className="pipeline-stage">
                          {stage}
                        </div>

                        <div className="pipeline-description">

                          {stage === 'Authentication' &&
                            'Verify authorised government source'}

                          {stage === 'Alert Intelligence' &&
                            'Extract emergency type, location and action'}

                          {stage === 'Serving Cell / Region' &&
                            'Map serving cell to regional language'}

                          {stage === 'Language Processing' &&
                            'English + Hindi + regional language'}

                          {stage === 'Audio Preparation' &&
                            'Short accessible multilingual audio'}

                          {stage === 'Alert Packaging' &&
                            'Critical message + safety information'}

                          {stage === 'Last-Mile Delivery' &&
                            'Cellular + Internet + Wired Relay'}

                          {stage === 'Citizen Response' &&
                            'Read status + acknowledgement'}

                        </div>
                      </div>

                    </div>
                  )
                })}

              </div>

            </section>

            {/* KPI CARDS */}

            <section className="kpi-grid">

              <div className="kpi-card">
                <div className="kpi-icon">📨</div>
                <div className="kpi-value">{sentCount}</div>
                <div className="kpi-label">ALERTS SENT</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">📱</div>
                <div className="kpi-value">{receivedCount}</div>
                <div className="kpi-label">RECEIVED</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">👁️</div>
                <div className="kpi-value">{readCount}</div>
                <div className="kpi-label">READ</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">🆘</div>
                <div className="kpi-value">{helpCount}</div>
                <div className="kpi-label">NEED HELP</div>
              </div>

            </section>

            {/* AUTHENTICATION */}

            <section className="content-grid">

              <div className="panel">

                <div className="panel-header">
                  <div>
                    <div className="section-label">
                      STAGE 1
                    </div>

                    <h2>
                      🛡️ Official Alert Authentication
                    </h2>
                  </div>

                  <span
                    className={
                      alertStatus === 'VERIFIED'
                        ? 'badge verified'
                        : alertStatus === 'REJECTED'
                          ? 'badge rejected'
                          : 'badge waiting'
                    }
                  >
                    {alertStatus === 'VERIFIED'
                      ? '✓ VERIFIED'
                      : alertStatus === 'REJECTED'
                        ? '✕ REJECTED'
                        : alertStatus === 'PROCESSING'
                          ? 'PROCESSING'
                          : alertStatus === 'CANCELLED'
                            ? 'CANCELLED'
                            : alertStatus === 'ALL CLEAR'
                              ? 'ALL CLEAR'
                              : 'WAITING FOR INPUT'}
                  </span>

                </div>

                <div className="info-grid">

                  <div>
                    <span>Source</span>
                    <strong>NDMA</strong>
                  </div>

                  <div>
                    <span>Authority</span>
                    <strong>
                      National Disaster Management Authority
                    </strong>
                  </div>

                  <div>
                    <span>Alert ID</span>
                    <strong>FLD-2026-001</strong>
                  </div>

                  <div>
                    <span>Timestamp</span>
                    <strong>
                      {new Date().toLocaleString()}
                    </strong>
                  </div>

                </div>

                <div className="verification-list">

                  <div>✓ Source identified</div>
                  <div>✓ Authority recognised</div>
                  <div>✓ Government credential valid</div>
                  <div>✓ Alert ID verified</div>
                  <div>✓ Timestamp valid</div>
                  <div>✓ Alert validity checked</div>

                </div>

              </div>

              {/* REGION */}

              <div className="panel">

                <div className="section-label">
                  SERVING CELL
                </div>

                <h2>
                  📍 Regional Language Mapping
                </h2>

                <select
                  value={selectedCell}
                  onChange={(event) =>
                    setSelectedCell(event.target.value)
                  }
                  className="cell-select"
                >
                  <option value="WB-KOL-042">
                    WB-KOL-042 — West Bengal
                  </option>

                  <option value="OD-BBS-019">
                    OD-BBS-019 — Odisha
                  </option>

                  <option value="TN-CHE-011">
                    TN-CHE-011 — Tamil Nadu
                  </option>

                  <option value="MH-MUM-031">
                    MH-MUM-031 — Maharashtra
                  </option>
                </select>

                <div className="region-result">

                  <div>
                    <span>Serving Cell</span>
                    <strong>{selectedCell}</strong>
                  </div>

                  <div>
                    <span>State</span>
                    <strong>{region.state}</strong>
                  </div>

                  <div>
                    <span>District</span>
                    <strong>{region.district}</strong>
                  </div>

                  <div>
                    <span>Regional Language</span>
                    <strong>{region.language}</strong>
                  </div>

                </div>

              </div>

            </section>

            {/* NETWORK */}

            <section className="panel">

              <div className="section-label">
                LAST-MILE NETWORK
              </div>

              <h2>
                📡 Delivery Channel Selection
              </h2>

              <div className="network-grid">

                <div className="network-card">
                  <div className="network-icon">📶</div>
                  <strong>Cell Broadcast</strong>
                  <span>
                    Critical warning delivery
                  </span>
                </div>

                <div className="network-card">
                  <div className="network-icon">🌐</div>
                  <strong>Internet Network</strong>
                  <span>
                    Full details, audio and visual guide
                  </span>
                </div>

                <div className="network-card">
                  <div className="network-icon">🔌</div>
                  <strong>Wired Relay</strong>
                  <span>
                    Control centre → local emergency station
                  </span>
                </div>

              </div>

              <div className="network-status">
                Current network status:
                <strong>{networkStatus}</strong>
              </div>

            </section>

            {/* EVENT LOG */}

            <section className="panel">

              <div className="section-label">
                SYSTEM EVENT LOG
              </div>

              <h2>
                📋 Live Activity
              </h2>

              <div className="event-log">

                {eventLog.slice(0, 8).map((event, index) => (
                  <div
                    className="event"
                    key={`${event}-${index}`}
                  >
                    <span>●</span>
                    {event}
                  </div>
                ))}

              </div>

            </section>
          </>
        )}

        {/* ===================================================
            PEOPLE VIEW
        ==================================================== */}

        {activePage === 'people' && (
          <section className="people-page">

            <div className="page-title">

              <div className="section-label">
                CITIZEN SIDE
              </div>

              <h1>
                👥 People View
              </h1>

              <p>
                This represents the citizen's phone after
                receiving the emergency alert.
              </p>

            </div>

            {!alertReceived ? (

              <div className="waiting-citizen">

                <div className="waiting-icon">
                  📱
                </div>

                <h2>
                  Waiting for Emergency Alert
                </h2>

                <p>
                  The citizen device is waiting for an
                  authenticated government warning.
                </p>

                <span>
                  Press "INPUT OFFICIAL ALERT" from the
                  Dashboard to start the demonstration.
                </span>

                <button
                  className="secondary-button"
                  onClick={() =>
                    setActivePage('dashboard')
                  }
                >
                  ← Go to Dashboard
                </button>

              </div>

            ) : (

              <div className="citizen-layout">

                {/* PHONE */}

                <div className="phone">

                  <div className="phone-top">
                    <span>9:41</span>
                    <span>
                      ● ● ● 🔋
                    </span>
                  </div>

                  <div className="phone-content">

                    <div className="phone-alert-icon">
                      🚨
                    </div>

                    <div className="phone-alert-title">
                      EXTREME ALERT
                    </div>

                    <div className="phone-alert-subtitle">
                      Take action now
                    </div>

                    <div className="phone-location">
                      📍 {region.district},{' '}
                      {region.state}
                    </div>

                    <div className="serving-cell">
                      📡 Serving Cell: {selectedCell}
                    </div>

                    {/* AUDIO */}

                    <div className="audio-box">

                      <div className="audio-title">
                        🔊 AUTOMATIC ALERT AUDIO
                      </div>

                      <div className="audio-languages">

                        <span>✓ English</span>
                        <span>✓ Hindi</span>
                        <span>
                          ✓ {region.language}
                        </span>

                      </div>

                      <button
                        className="audio-button"
                        onClick={playAudioSequence}
                        disabled={audioPlaying}
                      >
                        {audioPlaying
                          ? '🔊 PLAYING...'
                          : '🔊 PLAY AUDIO'}
                      </button>

                    </div>

                    {/* LANGUAGES */}

                    <div className="language-message">

                      <div className="language-card">

                        <div>
                          🇬🇧 ENGLISH
                        </div>

                        <p>
                          Flood warning. Move to higher
                          ground immediately.
                        </p>

                      </div>

                      <div className="language-card">

                        <div>
                          🇮🇳 हिन्दी
                        </div>

                        <p>
                          बाढ़ की चेतावनी। तुरंत ऊँचे
                          स्थान पर जाएँ।
                        </p>

                      </div>

                      <div className="language-card">

                        <div>
                          🇮🇳 {region.language}
                        </div>

                        <p>
                          {region.language === 'Bengali'
                            ? 'বন্যার সতর্কতা। অবিলম্বে উঁচু জায়গায় চলে যান।'
                            : region.language === 'Odia'
                              ? 'ବନ୍ୟା ସତର୍କତା। ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।'
                              : region.language === 'Tamil'
                                ? 'வெள்ள எச்சரிக்கை. உடனடியாக உயரமான இடத்திற்கு செல்லுங்கள்.'
                                : 'पूराचा इशारा. त्वरित उंच ठिकाणी जा.'}
                        </p>

                      </div>

                    </div>

                    <div className="safety-buttons">

                      <button>
                        🎥 Safety Instructions
                      </button>

                      <button>
                        🔗 More Information
                      </button>

                    </div>

                    {/* ACKNOWLEDGEMENT */}

                    <div className="acknowledgement">

                      <div className="ack-title">
                        Have you received the warning?
                      </div>

                      <div className="ack-buttons">

                        <button
                          className={
                            acknowledgement === 'NO ISSUE'
                              ? 'ack-button selected-good'
                              : 'ack-button'
                          }
                          onClick={() =>
                            submitAcknowledgement(
                              'NO ISSUE',
                            )
                          }
                        >
                          🟢 NO ISSUE
                        </button>

                        <button
                          className={
                            acknowledgement ===
                            'NEED HELP'
                              ? 'ack-button selected-help'
                              : 'ack-button'
                          }
                          onClick={() =>
                            submitAcknowledgement(
                              'NEED HELP',
                            )
                          }
                        >
                          🆘 NEED HELP
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

                {/* CITIZEN STATUS */}

                <div className="citizen-status">

                  <div className="panel">

                    <div className="section-label">
                      DELIVERY STATUS
                    </div>

                    <h2>
                      📊 Citizen Response
                    </h2>

                    <div className="status-row">
                      <span>Delivery</span>
                      <strong className="green-text">
                        RECEIVED
                      </strong>
                    </div>

                    <div className="status-row">
                      <span>Read Status</span>
                      <strong className="green-text">
                        READ
                      </strong>
                    </div>

                    <div className="status-row">
                      <span>Acknowledgement</span>
                      <strong>
                        {acknowledgement}
                      </strong>
                    </div>

                    <div className="status-row">
                      <span>Reminder Count</span>
                      <strong>
                        {reminderCount}
                      </strong>
                    </div>

                    <div className="status-row">
                      <span>Reminder Status</span>
                      <strong>
                        {reminderActive
                          ? 'ACTIVE'
                          : 'STOPPED'}
                      </strong>
                    </div>

                  </div>

                  {/* ASSISTANCE */}

                  {acknowledgement === 'NEED HELP' && (
                    <div className="assistance-card">

                      <div className="assistance-icon">
                        🆘
                      </div>

                      <div>

                        <div className="section-label">
                          RESPONSE COORDINATION
                        </div>

                        <h2>
                          Assistance Request Created
                        </h2>

                        <p>
                          Citizen has requested help.
                          The request is now visible to
                          the response coordination team.
                        </p>

                        <span className="request-id">
                          Request ID: HELP-{region.district
                            .slice(0, 3)
                            .toUpperCase()}-0042
                        </span>

                      </div>

                    </div>
                  )}

                  {/* NO ISSUE */}

                  {acknowledgement === 'NO ISSUE' && (
                    <div className="success-card">

                      <div className="success-icon">
                        ✓
                      </div>

                      <div>

                        <div className="section-label">
                          CITIZEN ACKNOWLEDGED
                        </div>

                        <h2>
                          No Assistance Required
                        </h2>

                        <p>
                          Reminder mechanism has stopped
                          for this citizen.
                        </p>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            )}

          </section>
        )}

        {/* ===================================================
            EDGE CASES
        ==================================================== */}

        {activePage === 'edge' && (
          <section className="edge-page">

            <div className="page-title">

              <div className="section-label">
                DEMONSTRATION CONTROLS
              </div>

              <h1>
                🧪 Edge Case Simulator
              </h1>

              <p>
                Use these controls during the hackathon to
                demonstrate failure handling.
              </p>

            </div>

            <div className="edge-grid">

              <button
                className="edge-button"
                onClick={rejectAlert}
              >
                ❌
                <strong>
                  Unauthorized Source
                </strong>
                <span>
                  Reject alert before processing
                </span>
              </button>

              <button
                className="edge-button"
                onClick={simulateNetworkFailure}
              >
                📡
                <strong>
                  Cellular Failure
                </strong>
                <span>
                  Use internet + wired relay
                </span>
              </button>

              <button
                className="edge-button"
                onClick={simulateUnknownCell}
              >
                📍
                <strong>
                  Unknown Serving Cell
                </strong>
                <span>
                  English + Hindi fallback
                </span>
              </button>

              <button
                className="edge-button"
                onClick={simulateAlertUpdate}
              >
                🔄
                <strong>
                  Alert Update
                </strong>
                <span>
                  Latest alert supersedes previous version
                </span>
              </button>

              <button
                className="edge-button"
                onClick={simulateCancellation}
              >
                🛑
                <strong>
                  Cancel Alert
                </strong>
                <span>
                  Stop reminders
                </span>
              </button>

              <button
                className="edge-button"
                onClick={simulateAllClear}
              >
                🟢
                <strong>
                  Official All Clear
                </strong>
                <span>
                  Close active emergency cycle
                </span>
              </button>

            </div>

            <section className="panel">

              <div className="section-label">
                CURRENT SYSTEM STATE
              </div>

              <div className="state-grid">

                <div>
                  <span>Alert</span>
                  <strong>
                    {alertStatus}
                  </strong>
                </div>

                <div>
                  <span>Serving Cell</span>
                  <strong>
                    {selectedCell}
                  </strong>
                </div>

                <div>
                  <span>Region</span>
                  <strong>
                    {region?.state || 'Unknown'}
                  </strong>
                </div>

                <div>
                  <span>Network</span>
                  <strong>
                    {networkStatus}
                  </strong>
                </div>

                <div>
                  <span>Reminder Count</span>
                  <strong>
                    {reminderCount}
                  </strong>
                </div>

                <div>
                  <span>Acknowledgement</span>
                  <strong>
                    {acknowledgement}
                  </strong>
                </div>

              </div>

            </section>

          </section>
        )}

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="footer">

        <div>
          Last-Mile Emergency Alert System
        </div>

        <div>
          Browser Simulation • K-1000 • KSAC • Hall A
        </div>

      </footer>

    </div>
  )
}

export default App