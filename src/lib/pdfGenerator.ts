import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { AISummaryResult, ActionItem } from '@/lib/types'

/**
 * Generate a PDF report of the meeting summary.
 */
export function generateMeetingPDF(
  summary: AISummaryResult, 
  transcript: string, 
  date: Date = new Date()
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 14
  let cursorY = 20

  // Title
  doc.setFontSize(22)
  doc.setTextColor(33, 33, 33)
  doc.text('Meeting Summary', margin, cursorY)
  
  // Date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(date.toLocaleString(), pageWidth - margin - 40, cursorY)
  cursorY += 15

  // 1. Executive Summary
  doc.setFontSize(14)
  doc.setTextColor(33, 33, 33)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Summary', margin, cursorY)
  cursorY += 8
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  const summaryLines = doc.splitTextToSize(summary.summary, pageWidth - margin * 2)
  doc.text(summaryLines, margin, cursorY)
  cursorY += summaryLines.length * 5 + 10

  // 2. Tone Analysis
  if (summary.tone_analysis) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Tone Analysis (${summary.sentiment || 'neutral'})`, margin, cursorY)
    cursorY += 8
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')
    const toneLines = doc.splitTextToSize(summary.tone_analysis, pageWidth - margin * 2)
    doc.text(toneLines, margin, cursorY)
    cursorY += toneLines.length * 5 + 10
  }

  // 3. Key Topics
  if (summary.key_topics && summary.key_topics.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontStyle('bold') 
    doc.text('Key Topics', margin, cursorY)
    cursorY += 8
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    summary.key_topics.forEach(topic => {
      doc.text(`• ${topic}`, margin + 5, cursorY)
      cursorY += 6
    })
    cursorY += 4
  }

  // 4. Action Items Table
  if (summary.action_items && summary.action_items.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Action Items', margin, cursorY + 5)
    
    const tableData = summary.action_items.map((item: ActionItem) => [
      item.task,
      item.due || '-',
      item.completed ? 'Done' : 'Pending'
    ])

    autoTable(doc, {
      startY: cursorY + 10,
      head: [['Task', 'Due Date', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 }
      },
      margin: { left: margin, right: margin }
    })
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorY = (doc as any).lastAutoTable.finalY + 15
  }

  // 5. Full Transcript (New Page)
  if (transcript) {
    doc.addPage()
    cursorY = 20
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(33, 33, 33)
    doc.text('Full Transcript', margin, cursorY)
    cursorY += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    
    const transcriptLines = doc.splitTextToSize(transcript, pageWidth - margin * 2)
    
    // Simple pagination for transcript
    let currentLine = 0
    const linesPerPage = 50
    
    while (currentLine < transcriptLines.length) {
      if (currentLine > 0) {
        doc.addPage()
        cursorY = 20
      }
      const pageLines = transcriptLines.slice(currentLine, currentLine + linesPerPage)
      doc.text(pageLines, margin, cursorY)
      currentLine += linesPerPage
    }
  }

  // Save
  doc.save(`meeting-summary-${date.toISOString().slice(0, 10)}.pdf`)
}
