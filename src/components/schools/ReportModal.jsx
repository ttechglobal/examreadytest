'use client'
import { useState, useEffect } from 'react'

// ─── Pure helpers (no side-effects) ──────────────────────────
function cap(s) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}
function pct(n) { return n != null ? `${Math.round(n)}%` : '—' }
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtMonth(ym) {
  if (!ym) return ym
  const [y, m] = ym.split('-')
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[parseInt(m, 10) - 1]} ${y}`
}
function todayFull() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
function statusOf(score) {
  if (score == null) return { label: 'No data', color: '#94A3B8', rgb: [148,163,184] }
  if (score >= 70)   return { label: 'Strong',       color: '#15803D', rgb: [21,128,61]  }
  if (score >= 40)   return { label: 'Needs Work',   color: '#D97706', rgb: [180,83,9]   }
                     return { label: 'Critical',     color: '#DC2626', rgb: [185,28,28]  }
}
function slugify(s) { return (s || 'report').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

// ─── CSV generator ────────────────────────────────────────────
function generateCSV(cfg, data) {
  const { institution, studentStats = [], subjectStats = [], topPerformers = [], consistentImprovers = [], monthlyTrends = [], studentSessionHistory = {} } = data
  const { audience, scope, studentId } = cfg
  const L = []

  const push = (...rows) => rows.forEach(r => L.push(r))
  push(
    `"${institution?.name || 'Institution'} — Exam Readiness Report"`,
    `"Generated: ${todayFull()}"`,
    `"Report type: ${cap(audience)}"`,
    ''
  )

  const filteredStudents = studentId ? studentStats.filter(s => s.id === studentId) : studentStats

  if (scope.summary) {
    const total = filteredStudents.length
    const avg   = total ? Math.round(filteredStudents.reduce((a, s) => a + (s.avgScore ?? 0), 0) / total) : null
    push('PERFORMANCE SUMMARY', 'Metric,Value',
      `Total Students,${total}`,
      `Average Score,${pct(avg)}`,
      `Subjects Tracked,${subjectStats.length}`,
      `Most Improved Students,${consistentImprovers.length}`,
      ''
    )
  }

  if (scope.subjects) {
    push('SUBJECT PERFORMANCE', 'Subject,Sessions,Average Score,Status')
    subjectStats.forEach(s => push(`"${cap(s.subject)}",${s.sessionCount},${pct(s.avgScore)},${statusOf(s.avgScore).label}`))
    push('')
  }

  if (scope.topics) {
    push('TOPIC BREAKDOWN', 'Subject,Topic,Average Score,Sample Size,Status')
    subjectStats.forEach(s =>
      (s.allTopics || []).forEach(t =>
        push(`"${cap(s.subject)}","${t.topicTitle}",${pct(t.avgScore)},${t.sampleSize},${statusOf(t.avgScore).label}`)
      )
    )
    push('')
  }

  if (scope.students) {
    push('STUDENT PERFORMANCE', 'Student,Sessions,Average Score,Improvement,Status,Last Active')
    filteredStudents.forEach(s =>
      push(`"${s.name}",${s.sessionCount},${pct(s.avgScore)},${s.improvement != null ? (s.improvement > 0 ? '+' : '') + s.improvement + '%' : '—'},${statusOf(s.avgScore).label},${fmtDate(s.lastActive)}`)
    )
    push('')
  }

  if (scope.monthly && monthlyTrends.length) {
    push('MONTH-BY-MONTH PROGRESS', 'Month,Average Score,Sessions')
    monthlyTrends.forEach(m => push(`"${fmtMonth(m.month)}",${pct(m.avgScore)},${m.count}`))
    push('')
  }

  if (scope.highlights) {
    if (topPerformers.length) {
      push('TOP PERFORMERS', 'Rank,Student,Sessions,Average Score')
      topPerformers.forEach((s, i) => push(`${i + 1},"${s.name}",${s.sessionCount},${pct(s.avgScore)}`))
      push('')
    }
    if (consistentImprovers.length) {
      push('MOST IMPROVED', 'Student,Average Score,Improvement')
      consistentImprovers.forEach(s => push(`"${s.name}",${pct(s.avgScore)},+${s.improvement}%`))
      push('')
    }
  }

  const blob = new Blob([L.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), {
    href: url,
    download: `${slugify(institution?.name)}-${audience}-${new Date().toISOString().slice(0, 10)}.csv`,
  }).click()
  URL.revokeObjectURL(url)
}

// ─── Word/HTML generator ──────────────────────────────────────
function generateWord(cfg, data) {
  const { institution, studentStats = [], subjectStats = [], topPerformers = [], consistentImprovers = [], monthlyTrends = [] } = data
  const { audience, scope, studentId } = cfg
  const filteredStudents = studentId ? studentStats.filter(s => s.id === studentId) : studentStats

  const sc = (score) => score >= 70 ? '#15803D' : score >= 40 ? '#D97706' : '#DC2626'

  let h = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: Calibri, Arial, sans-serif; margin: 48px; color: #0F172A; font-size: 11pt; line-height: 1.5 }
  .header { background: #0F172A; color: white; padding: 24px 28px; margin: -48px -48px 32px; }
  .header h1 { margin: 0 0 4px; font-size: 18pt; color: white }
  .header p  { margin: 0; font-size: 10pt; color: #94A3B8 }
  h2 { font-size: 13pt; color: #0F172A; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 4px; margin-top: 28px }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 12px 0 }
  th { background: #0F172A; color: white; padding: 8px 10px; text-align: left; font-size: 9pt }
  td { padding: 7px 10px; border-bottom: 1px solid #F1F5F9 }
  tr:nth-child(even) td { background: #F8FAFB }
  .stat-grid { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0 }
  .stat-box { background: #F8FAFB; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; min-width: 120px }
  .stat-box .val { font-size: 20pt; font-weight: bold; color: #0F172A; margin: 0 }
  .stat-box .lbl { font-size: 9pt; color: #64748B; margin: 2px 0 0 }
  .footer { margin-top: 48px; padding-top: 12px; border-top: 1px solid #E2E8F0; font-size: 9pt; color: #94A3B8 }
</style>
</head><body>
<div class="header">
  <h1>${institution?.name || 'School'} — Exam Readiness Report</h1>
  <p>Generated ${todayFull()} &nbsp;·&nbsp; ${cap(audience)} Report &nbsp;·&nbsp; Exam Ready Test Platform</p>
</div>`

  if (scope.summary) {
    const avg = filteredStudents.length ? Math.round(filteredStudents.reduce((a, s) => a + (s.avgScore ?? 0), 0) / filteredStudents.length) : null
    h += `<h2>Performance Summary</h2>
    <div class="stat-grid">
      <div class="stat-box"><p class="val">${filteredStudents.length}</p><p class="lbl">Students</p></div>
      <div class="stat-box"><p class="val" style="color:${sc(avg)}">${pct(avg)}</p><p class="lbl">Avg Score</p></div>
      <div class="stat-box"><p class="val">${subjectStats.length}</p><p class="lbl">Subjects</p></div>
      <div class="stat-box"><p class="val">${consistentImprovers.length}</p><p class="lbl">Improving</p></div>
    </div>`
  }

  if (scope.subjects) {
    h += `<h2>Subject Performance</h2><table>
    <tr><th>Subject</th><th>Sessions</th><th>Avg Score</th><th>Status</th></tr>`
    subjectStats.forEach(s => {
      const st = statusOf(s.avgScore)
      h += `<tr><td><strong>${cap(s.subject)}</strong></td><td>${s.sessionCount}</td>
        <td><strong style="color:${st.color}">${pct(s.avgScore)}</strong></td>
        <td style="color:${st.color};font-weight:bold">${st.label}</td></tr>`
    })
    h += '</table>'
  }

  if (scope.topics) {
    subjectStats.forEach(s => {
      if (!s.allTopics?.length) return
      h += `<h2>${cap(s.subject)} — Topic Breakdown</h2><table>
      <tr><th>Topic</th><th>Avg Score</th><th>Status</th></tr>`
      s.allTopics.forEach(t => {
        const st = statusOf(t.avgScore)
        h += `<tr><td>${t.topicTitle}</td>
          <td style="color:${st.color}"><strong>${pct(t.avgScore)}</strong></td>
          <td style="color:${st.color};font-weight:bold">${st.label}</td></tr>`
      })
      h += '</table>'
    })
  }

  if (scope.students) {
    h += `<h2>Student Performance</h2><table>
    <tr><th>Student</th><th>Sessions</th><th>Avg Score</th><th>Improvement</th><th>Status</th></tr>`
    filteredStudents.forEach(s => {
      const st  = statusOf(s.avgScore)
      const imp = s.improvement != null ? (s.improvement > 0 ? '+' : '') + s.improvement + '%' : '—'
      const ic  = s.improvement > 0 ? '#15803D' : s.improvement < 0 ? '#DC2626' : '#64748B'
      h += `<tr><td><strong>${s.name}</strong></td><td>${s.sessionCount}</td>
        <td style="color:${st.color}"><strong>${pct(s.avgScore)}</strong></td>
        <td style="color:${ic}">${imp}</td>
        <td style="color:${st.color};font-weight:bold">${st.label}</td></tr>`
    })
    h += '</table>'
  }

  if (scope.monthly && monthlyTrends.length) {
    h += `<h2>Month-by-Month Progress</h2><table>
    <tr><th>Month</th><th>Average Score</th><th>Sessions</th></tr>`
    monthlyTrends.forEach(m => {
      const st = statusOf(m.avgScore)
      h += `<tr><td>${fmtMonth(m.month)}</td>
        <td style="color:${st.color}"><strong>${pct(m.avgScore)}</strong></td>
        <td>${m.count}</td></tr>`
    })
    h += '</table>'
  }

  if (scope.highlights && (topPerformers.length || consistentImprovers.length)) {
    if (topPerformers.length) {
      h += `<h2>🏆 Top Performers</h2><table>
      <tr><th>Rank</th><th>Student</th><th>Sessions</th><th>Avg Score</th></tr>`
      topPerformers.forEach((s, i) => {
        h += `<tr><td>${i + 1}</td><td><strong>${s.name}</strong></td><td>${s.sessionCount}</td>
          <td style="color:#15803D"><strong>${pct(s.avgScore)}</strong></td></tr>`
      })
      h += '</table>'
    }
    if (consistentImprovers.length) {
      h += `<h2>📈 Most Improved</h2><table>
      <tr><th>Student</th><th>Average Score</th><th>Improvement</th></tr>`
      consistentImprovers.forEach(s => {
        h += `<tr><td><strong>${s.name}</strong></td><td>${pct(s.avgScore)}</td>
          <td style="color:#15803D">+${s.improvement}%</td></tr>`
      })
      h += '</table>'
    }
  }

  h += `<div class="footer">${institution?.name || ''} &nbsp;·&nbsp; Exam Readiness Report &nbsp;·&nbsp; ${todayFull()} &nbsp;·&nbsp; Exam Ready Test Platform</div>
</body></html>`

  const blob = new Blob([h], { type: 'application/msword' })
  const url  = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), {
    href: url,
    download: `${slugify(institution?.name)}-${audience}-${new Date().toISOString().slice(0, 10)}.doc`,
  }).click()
  URL.revokeObjectURL(url)
}

// ─── PDF generator (jsPDF + jspdf-autotable) ──────────────────
async function generatePDF(cfg, data) {
  const { jsPDF }           = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const {
    institution, studentStats = [], subjectStats = [],
    topPerformers = [], consistentImprovers = [],
    monthlyTrends = [], areasToImprove = [],
  } = data
  const { audience, scope, studentId } = cfg
  const filteredStudents = studentId ? studentStats.filter(s => s.id === studentId) : studentStats
  const singleStudent    = studentId ? filteredStudents[0] : null

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W   = doc.internal.pageSize.getWidth()   // 210
  const H   = doc.internal.pageSize.getHeight()  // 297
  const ML  = 16   // margin left
  const MR  = 16   // margin right
  const CW  = W - ML - MR  // content width
  let   y   = 0

  // ── Colour palette ──────────────────────────────────────────
  const NAVY  = [15,  23,  42]
  const BLUE  = [45,  60,  230]
  const GREEN = [21,  128, 61]
  const AMBER = [180, 83,  9]
  const RED   = [185, 28,  28]
  const GREY  = [71,  85,  105]
  const LGREY = [241, 245, 249]
  const WHITE = [255, 255, 255]
  const SLATE = [30,  41,  59]

  function statusRGB(score) {
    if (score == null) return GREY
    return score >= 70 ? GREEN : score >= 40 ? AMBER : RED
  }

  // ── Page management ─────────────────────────────────────────
  function newPage() {
    doc.addPage()
    y = 22
  }

  function need(h) {
    if (y + h > H - 20) newPage()
  }

  // ── Drawing helpers ──────────────────────────────────────────
  function rule(yy, alpha = 0.15) {
    doc.setDrawColor(...LGREY)
    doc.setLineWidth(0.25)
    doc.line(ML, yy, W - MR, yy)
  }

  function sectionTitle(label) {
    need(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...NAVY)
    doc.text(label.toUpperCase(), ML, y)
    doc.setDrawColor(...BLUE)
    doc.setLineWidth(0.5)
    doc.line(ML, y + 1.5, ML + doc.getTextWidth(label.toUpperCase()), y + 1.5)
    y += 7
  }

  // ── Cover / header band ──────────────────────────────────────
  // Gradient-like header using layered rects
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 44, 'F')
  doc.setFillColor(30, 41, 59)
  doc.rect(0, 36, W, 8, 'F')

  // School name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...WHITE)
  doc.text(institution?.name || 'Institution', ML, 16)

  // Subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(148, 163, 184)
  const subTitle = [
    'Exam Readiness Report',
    `${cap(audience)} Edition`,
    todayFull(),
  ].join('   ·   ')
  doc.text(subTitle, ML, 24)

  // Report type pill
  const pillW = 38
  doc.setFillColor(...BLUE)
  doc.roundedRect(ML, 29, pillW, 7, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...WHITE)
  doc.text(cap(audience) + ' Report', ML + pillW / 2, 33.8, { align: 'center' })

  // Date range note
  if (monthlyTrends.length >= 2) {
    const first = fmtMonth(monthlyTrends[0].month)
    const last  = fmtMonth(monthlyTrends[monthlyTrends.length - 1].month)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(`${first} — ${last}`, W - MR, 33.8, { align: 'right' })
  }

  y = 54

  // ── Student name callout (individual report) ─────────────────
  if (singleStudent) {
    doc.setFillColor(...LGREY)
    doc.roundedRect(ML, y, CW, 16, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...NAVY)
    doc.text(singleStudent.name, ML + 8, y + 7)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GREY)
    doc.text(`${singleStudent.sessionCount} session${singleStudent.sessionCount !== 1 ? 's' : ''}  ·  Avg ${pct(singleStudent.avgScore)}  ·  ${statusOf(singleStudent.avgScore).label}`, ML + 8, y + 12)
    y += 22
  }

  // ── Summary stat cards ───────────────────────────────────────
  if (scope.summary) {
    need(30)
    sectionTitle('Performance Summary')

    const avg   = filteredStudents.length
      ? Math.round(filteredStudents.reduce((a, s) => a + (s.avgScore ?? 0), 0) / filteredStudents.length)
      : null
    const improved = filteredStudents.filter(s => (s.improvement ?? 0) > 0).length

    const cards = [
      { label: 'Students',   value: String(filteredStudents.length) },
      { label: 'Avg Score',  value: pct(avg),   color: statusRGB(avg) },
      { label: 'Subjects',   value: String(subjectStats.length) },
      { label: 'Improving',  value: String(improved), color: GREEN },
    ]

    const gap = 3
    const cw  = (CW - gap * 3) / 4
    cards.forEach((c, i) => {
      const cx = ML + i * (cw + gap)
      doc.setFillColor(...LGREY)
      doc.roundedRect(cx, y, cw, 18, 2, 2, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...GREY)
      doc.text(c.label.toUpperCase(), cx + cw / 2, y + 5.5, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(...(c.color || NAVY))
      doc.text(c.value, cx + cw / 2, y + 13.5, { align: 'center' })
    })
    y += 24
  }

  // ── Subject performance table ────────────────────────────────
  if (scope.subjects && subjectStats.length) {
    need(20)
    sectionTitle('Subject Performance')

    autoTable(doc, {
      startY: y,
      head: [['Subject', 'Sessions', 'Avg Score', 'Status']],
      body: subjectStats.map(s => [cap(s.subject), String(s.sessionCount), pct(s.avgScore), statusOf(s.avgScore).label]),
      margin: { left: ML, right: MR },
      styles: { fontSize: 8.5, cellPadding: 2.8, font: 'helvetica' },
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5, cellPadding: 3 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' }, 3: { fontStyle: 'bold' } },
      didParseCell(d) {
        if (d.section !== 'body') return
        if (d.column.index === 3) {
          d.cell.styles.textColor = statusOf(subjectStats[d.row.index]?.avgScore).rgb
        }
        if (d.column.index === 2) {
          d.cell.styles.textColor = statusRGB(parseInt(d.cell.text[0]))
        }
      },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ── Topic breakdown ───────────────────────────────────────────
  if (scope.topics) {
    subjectStats.forEach(sub => {
      if (!sub.allTopics?.length) return
      need(20)
      sectionTitle(`${cap(sub.subject)} — Topics`)
      autoTable(doc, {
        startY: y,
        head: [['Topic', 'Avg Score', 'Responses', 'Status']],
        body: sub.allTopics.map(t => [t.topicTitle, pct(t.avgScore), String(t.sampleSize), statusOf(t.avgScore).label]),
        margin: { left: ML, right: MR },
        styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
        headStyles: { fillColor: SLATE, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5, cellPadding: 3 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 1: { fontStyle: 'bold' }, 3: { fontStyle: 'bold' } },
        didParseCell(d) {
          if (d.section !== 'body') return
          if (d.column.index === 3) d.cell.styles.textColor = statusOf(sub.allTopics[d.row.index]?.avgScore).rgb
          if (d.column.index === 1) d.cell.styles.textColor = statusRGB(parseInt(d.cell.text[0]))
        },
      })
      y = doc.lastAutoTable.finalY + 8
    })
  }

  // ── Student table ────────────────────────────────────────────
  if (scope.students && filteredStudents.length) {
    need(20)
    sectionTitle(singleStudent ? 'Session History' : 'Student Performance')

    if (singleStudent) {
      // Individual: show per-session history if available
      const hist = (data.studentSessionHistory || {})[singleStudent.id] || []
      if (hist.length) {
        autoTable(doc, {
          startY: y,
          head: [['Date', 'Subject', 'Score']],
          body: hist.map(h => [fmtDate(h.date), cap(h.subject), pct(h.percentage)]),
          margin: { left: ML, right: MR },
          styles: { fontSize: 8.5, cellPadding: 2.8, font: 'helvetica' },
          headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          didParseCell(d) {
            if (d.section === 'body' && d.column.index === 2) {
              d.cell.styles.textColor = statusRGB(parseInt(d.cell.text[0]))
              d.cell.styles.fontStyle = 'bold'
            }
          },
        })
        y = doc.lastAutoTable.finalY + 8
      }
    } else {
      autoTable(doc, {
        startY: y,
        head: [['Student', 'Sessions', 'Avg Score', 'Change', 'Status', 'Last Active']],
        body: filteredStudents.map(s => [
          s.name,
          String(s.sessionCount),
          pct(s.avgScore),
          s.improvement != null ? (s.improvement > 0 ? '+' : '') + s.improvement + '%' : '—',
          statusOf(s.avgScore).label,
          fmtDate(s.lastActive),
        ]),
        margin: { left: ML, right: MR },
        styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' }, 4: { fontStyle: 'bold' } },
        didParseCell(d) {
          if (d.section !== 'body') return
          if (d.column.index === 4) d.cell.styles.textColor = statusOf(filteredStudents[d.row.index]?.avgScore).rgb
          if (d.column.index === 2) d.cell.styles.textColor = statusRGB(parseInt(d.cell.text[0]))
          if (d.column.index === 3) {
            const raw = d.cell.text[0]
            if (raw.startsWith('+')) d.cell.styles.textColor = GREEN
            else if (raw.startsWith('-')) d.cell.styles.textColor = RED
          }
        },
      })
      y = doc.lastAutoTable.finalY + 8
    }
  }

  // ── Monthly trends ────────────────────────────────────────────
  if (scope.monthly && monthlyTrends.length) {
    need(20)
    sectionTitle('Month-by-Month Progress')

    // Sparkline-style bar chart
    const barH     = 28
    const barY     = y
    const barCount = monthlyTrends.length
    const barW     = Math.min(CW / barCount - 2, 22)
    const maxScore = 100

    monthlyTrends.forEach((m, i) => {
      const bh = (m.avgScore / maxScore) * barH
      const bx = ML + i * (CW / barCount)
      const by = barY + barH - bh

      doc.setFillColor(...statusRGB(m.avgScore), 0.7)
      doc.setFillColor(...statusRGB(m.avgScore))
      doc.roundedRect(bx + 1, by, barW, bh, 1, 1, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(...statusRGB(m.avgScore))
      doc.text(pct(m.avgScore), bx + barW / 2 + 1, by - 1.5, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(...GREY)
      const shortMonth = fmtMonth(m.month).slice(0, 3)
      doc.text(shortMonth, bx + barW / 2 + 1, barY + barH + 4, { align: 'center' })
    })

    // Baseline rule
    rule(barY + barH + 0.5)
    y += barH + 10
  }

  // ── Areas to improve callout ──────────────────────────────────
  if (scope.summary && areasToImprove.length) {
    need(16)
    sectionTitle('Priority Areas')

    areasToImprove.slice(0, 4).forEach((a, i) => {
      const cardY = y
      const urgency = a.avgScore < 40 ? RED : AMBER

      doc.setFillColor(urgency[0], urgency[1], urgency[2], 0.06)
      doc.setFillColor(urgency[0] === RED[0] ? 254 : 255, urgency[0] === RED[0] ? 242 : 251, urgency[0] === RED[0] ? 242 : 235)
      doc.setDrawColor(...urgency)
      doc.setLineWidth(0.4)
      doc.roundedRect(ML, cardY, CW, 12, 2, 2, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...urgency)
      doc.text(cap(a.subject), ML + 4, cardY + 5)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...GREY)
      const weakList = (a.weakTopics || []).slice(0, 3).map(t => t.topicTitle).join(' · ')
      if (weakList) doc.text(weakList, ML + 4, cardY + 9.5)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...urgency)
      doc.text(pct(a.avgScore), W - MR - 2, cardY + 7, { align: 'right' })
      y += 14
    })
    y += 4
  }

  // ── Highlights ────────────────────────────────────────────────
  if (scope.highlights && (topPerformers.length || consistentImprovers.length)) {
    need(20)
    sectionTitle('Highlights')

    const halfW = (CW - 4) / 2

    if (topPerformers.length) {
      autoTable(doc, {
        startY: y,
        head: [['🏆 Top Performers', 'Score']],
        body: topPerformers.map((s, i) => [`${i + 1}. ${s.name}`, pct(s.avgScore)]),
        tableWidth: halfW,
        margin: { left: ML, right: ML + halfW + 4 },
        styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
        headStyles: { fillColor: [120, 53, 15], textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [255, 251, 235] },
        didParseCell(d) {
          if (d.section === 'body' && d.column.index === 1) d.cell.styles.textColor = GREEN
        },
      })
    }

    if (consistentImprovers.length) {
      autoTable(doc, {
        startY: y,
        head: [['📈 Most Improved', 'Gain']],
        body: consistentImprovers.map(s => [s.name, `+${s.improvement}%`]),
        tableWidth: halfW,
        margin: { left: ML + halfW + 4, right: MR },
        styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
        headStyles: { fillColor: [6, 78, 59], textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        didParseCell(d) {
          if (d.section === 'body' && d.column.index === 1) d.cell.styles.textColor = GREEN
        },
      })
    }

    y = doc.lastAutoTable.finalY + 10
  }

  // ── Footer on every page ──────────────────────────────────────
  const pages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setDrawColor(...LGREY)
    doc.setLineWidth(0.25)
    doc.line(ML, H - 12, W - MR, H - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...GREY)
    doc.text(`${institution?.name || ''} · Exam Readiness Report · ${todayFull()}`, ML, H - 7)
    doc.text(`Page ${p} of ${pages}`, W - MR, H - 7, { align: 'right' })
  }

  const fname = `${slugify(institution?.name)}-${audience}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fname)
}

// ─── The modal UI ─────────────────────────────────────────────
const AUDIENCES = [
  { id: 'admin',   icon: '🏫', label: 'Admin',   desc: 'Full overview — all students & subjects' },
  { id: 'tutor',   icon: '👩‍🏫', label: 'Tutor',   desc: 'Topic gaps and class weak areas' },
  { id: 'parent',  icon: '👨‍👩‍👧', label: 'Parent',  desc: 'Individual child progress' },
  { id: 'student', icon: '🎓', label: 'Student', desc: 'Personal scores and improvement' },
]
const SCOPE_OPTS = [
  { id: 'summary',    label: 'Performance Summary',       desc: 'Key metrics at a glance' },
  { id: 'subjects',   label: 'Subject Breakdown',         desc: 'Average score per subject' },
  { id: 'topics',     label: 'Topic-Level Detail',        desc: 'Exactly where students struggle' },
  { id: 'students',   label: 'Student Performance',       desc: 'Individual scores and trends' },
  { id: 'monthly',    label: 'Month-by-Month Progress',   desc: 'Improvement over time' },
  { id: 'highlights', label: 'Top Performers & Improvers','desc': 'Recognition and highlights' },
]
const FORMATS = [
  { id: 'pdf',  icon: '📄', label: 'PDF',   desc: 'Print-ready, polished document' },
  { id: 'csv',  icon: '📊', label: 'CSV',   desc: 'Raw data for spreadsheets' },
  { id: 'word', icon: '📝', label: 'Word',  desc: 'Editable .doc file' },
]

function defaultScope(audience) {
  if (audience === 'parent' || audience === 'student')
    return { summary: true, students: true, subjects: true, monthly: true, topics: false, highlights: false }
  if (audience === 'tutor')
    return { summary: true, subjects: true, topics: true, students: true, monthly: false, highlights: false }
  return { summary: true, subjects: true, topics: true, students: true, monthly: true, highlights: true }
}

export default function ReportModal({ data, onClose }) {
  const {
    institution, studentStats = [], subjectStats = [],
    cohorts = [],
  } = data || {}

  const [audience,   setAudienceRaw] = useState('admin')
  const [scope,      setScope]       = useState(defaultScope('admin'))
  const [studentId,  setStudentId]   = useState('')
  const [format,     setFormat]      = useState('pdf')
  const [generating, setGenerating]  = useState(false)
  const [done,       setDone]        = useState(false)
  const [err,        setErr]         = useState(null)

  function setAudience(a) {
    setAudienceRaw(a)
    setScope(defaultScope(a))
    if (a !== 'parent' && a !== 'student') setStudentId('')
  }

  function toggleScope(key) {
    setScope(p => ({ ...p, [key]: !p[key] }))
  }

  const activeCount = Object.values(scope).filter(Boolean).length

  async function handleGenerate() {
    if (!activeCount) return
    setGenerating(true); setDone(false); setErr(null)
    const cfg = { audience, scope, studentId: studentId || null }
    try {
      if (format === 'pdf')  await generatePDF(cfg, data)
      if (format === 'csv')  generateCSV(cfg, data)
      if (format === 'word') generateWord(cfg, data)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } catch (e) {
      console.error('Report generation failed:', e)
      setErr('Something went wrong generating the report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const needsStudent = audience === 'parent' || audience === 'student'

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(3px)',
      }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%',
        maxWidth: 580, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        fontFamily: 'Nunito, sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{ background: '#0F172A', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <p style={{ fontWeight: 900, fontSize: 16, color: '#fff', margin: 0 }}>Generate Report</p>
            <p style={{ fontSize: 11, color: '#475569', margin: '3px 0 0' }}>
              {institution?.name} · {studentStats.length} student{studentStats.length !== 1 ? 's' : ''} · {subjectStats.length} subject{subjectStats.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#94A3B8', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>

          {/* Audience */}
          <Section label="Who is this report for?">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {AUDIENCES.map(a => (
                <button key={a.id} onClick={() => setAudience(a.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '11px 13px', border: `1.5px solid ${audience === a.id ? '#2D3CE6' : '#E8EAED'}`,
                    borderRadius: 11, background: audience === a.id ? '#F5F7FF' : '#fff',
                    cursor: 'pointer', fontFamily: 'Nunito, sans-serif', textAlign: 'left', transition: 'all 0.12s',
                  }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 13, color: audience === a.id ? '#2D3CE6' : '#0A0A0A', margin: '0 0 2px' }}>{a.label}</p>
                    <p style={{ fontSize: 11, color: '#64748B', margin: 0, lineHeight: 1.4 }}>{a.desc}</p>
                  </div>
                  {audience === a.id && (
                    <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: '#2D3CE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* Individual student picker */}
          {needsStudent && studentStats.length > 0 && (
            <Section label="Which student?">
              <select value={studentId} onChange={e => setStudentId(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #E8EAED', borderRadius: 9, padding: '10px 14px', fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, background: '#fff', outline: 'none', cursor: 'pointer', color: '#0A0A0A', transition: 'border-color 0.12s' }}
                onFocus={e => e.target.style.borderColor = '#2D3CE6'}
                onBlur={e => e.target.style.borderColor = '#E8EAED'}>
                <option value="">All students</option>
                {studentStats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Section>
          )}

          {/* Scope */}
          <Section label="What should it include?">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {SCOPE_OPTS.map(s => (
                <ScopeRow key={s.id} item={s} checked={!!scope[s.id]} onChange={() => toggleScope(s.id)}/>
              ))}
            </div>
          </Section>

          {/* Format */}
          <Section label="Export format">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  style={{
                    padding: '12px 8px', border: `1.5px solid ${format === f.id ? '#2D3CE6' : '#E8EAED'}`,
                    borderRadius: 11, background: format === f.id ? '#F5F7FF' : '#fff',
                    cursor: 'pointer', fontFamily: 'Nunito, sans-serif', textAlign: 'center', transition: 'all 0.12s',
                  }}>
                  <p style={{ fontSize: 22, margin: '0 0 4px' }}>{f.icon}</p>
                  <p style={{ fontWeight: 800, fontSize: 13, color: format === f.id ? '#2D3CE6' : '#0A0A0A', margin: '0 0 2px' }}>{f.label}</p>
                  <p style={{ fontSize: 10.5, color: '#64748B', margin: 0 }}>{f.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {err && (
            <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 12px', margin: '4px 0 0' }}>{err}</p>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '14px 24px 18px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#fff', color: '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
            Cancel
          </button>
          <button onClick={handleGenerate} disabled={generating || !activeCount}
            style={{
              flex: 2, padding: '12px 0', border: 'none', borderRadius: 10,
              background: done ? '#15803D' : generating || !activeCount ? '#E2E8F0' : '#2D3CE6',
              color: generating || !activeCount ? '#94A3B8' : '#fff',
              fontWeight: 800, fontSize: 14, cursor: generating || !activeCount ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito, sans-serif', transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {done ? '✓ Downloaded!' : generating ? (
              <>
                <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'reportSpin 0.6s linear infinite' }}/>
                Generating…
              </>
            ) : `Generate ${format.toUpperCase()} →`}
          </button>
        </div>
      </div>

      <style>{`@keyframes reportSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── Small sub-components ────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{ fontWeight: 800, fontSize: 12, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{label}</p>
      {children}
    </div>
  )
}

function ScopeRow({ item, checked, onChange }) {
  return (
    <label onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px',
        border: `1.5px solid ${checked ? '#2D3CE6' : '#E8EAED'}`,
        borderRadius: 10, background: checked ? '#F5F7FF' : '#fff',
        cursor: 'pointer', transition: 'all 0.12s',
      }}>
      <div style={{
        width: 17, height: 17, borderRadius: 4,
        border: `2px solid ${checked ? '#2D3CE6' : '#CBD5E1'}`,
        background: checked ? '#2D3CE6' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.12s',
      }}>
        {checked && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: 13, color: '#0A0A0A', margin: 0 }}>{item.label}</p>
        <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{item.desc}</p>
      </div>
    </label>
  )
}