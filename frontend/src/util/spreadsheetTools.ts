import { ElectionResultsInfo, ResultCandidateInfo } from '../types'
import ExcelJS from 'exceljs'
import {saveAs} from 'file-saver'
import { t } from 'i18next'

export const generateResultsSpreadsheet = async (results : ElectionResultsInfo) => {
	const wb = new ExcelJS.Workbook()
	wb.created = new Date()

	const ws = wb.addWorksheet('Results')

	ws.columns = [
		{ key: 'candidates', width: 50, style: {alignment: {shrinkToFit: true, horizontal: 'left'}}},
		{ key: 'votes', width: 10, style: {alignment: {horizontal: 'right'}}}
	]

	ws.addRow([t('spreadsheet.resultHeader', {electionTitle: results.title})])
	ws.getRow(ws.rowCount).font = {bold: true, size: 32}
	ws.mergeCells('A1:W1')
	ws.getRow(ws.rowCount)


	ws.addRow([])
	ws.addRow([t('spreadsheet.candidate'), t('spreadsheet.votes')])
	ws.getRow(ws.rowCount).getCell(2).alignment = {horizontal: 'right'}
	ws.getRow(ws.rowCount).font = {bold: true}
	ws.getRow(ws.rowCount).border = {
		bottom: {style: 'medium'}
	}
	ws.views = [{
		state: 'frozen', ySplit: ws.rowCount, xSplit: 0
	}]

	const orderedResults : ResultCandidateInfo[] = []

	Object.entries(results.votes).forEach((resultInfo, index) => {
		orderedResults.push({name: resultInfo[0], votes: resultInfo[1], position: index})
	})

	orderedResults.sort((a,b) => b.votes - a.votes)

	orderedResults.forEach((result) => {
		ws.addRow([result.name, result.votes])
	})

	ws.getRow(ws.rowCount).border = {
		bottom: {style: 'thin'}
	}

	ws.addRow([])
	ws.addRow([t('spreadsheet.emptyVotes'), results.emptyVotes])

	const buffer = await wb.xlsx.writeBuffer()

	saveAs(new Blob([buffer]), `${results.title.replace(/ /g, '_')}-results.xlsx`)
	
}