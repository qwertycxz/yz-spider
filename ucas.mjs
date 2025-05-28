import axios from 'axios'
import exceljs from 'exceljs'
async function get(url) {
	let ms = 1000
	while (true) {
		try {
			await new Promise(resolve => setTimeout(() => resolve(), ms))
			const msg = (await axios(url, {
				headers: {
					'cookie': '请自行补全',
				}
			})).data.msg
			if (!msg.list) {
				throw new Error(msg)
			}
			return msg
		} catch (e) {
			console.log(e, ms, url)
			ms *= 2
		}
	}
}
const workbook = new exceljs.Workbook()
const worksheet = workbook.addWorksheet('国科')
worksheet.addRow(['专业', '院系所', '考试方式', '学习方式', '研究方向', '退役计划', '少骨计划', '指导教师', '拟招生人数', '备注', '政治', '政治备注', '外语', '外语备注', '业务课一', '业务课一备注', '业务课二', '业务课二备注'])
for (let i = 0; true; i += 10) {
	const majors = await get(`https://yz.chsi.com.cn/zsml/rs/dwzys.do?dwdm=14430&start=${i}`)
	for (let major of majors.list) {
		for (let j = 0; true; j += 10) {
			const subjects = await get(`https://yz.chsi.com.cn/zsml/rs/yjfxs.do?dwdm=${major.dwdm}&start=${j}&zydm=${major.zydm}`)
			for (let subject of subjects.list) {
				worksheet.addRow(subject.kskmz.reduce((accumulator, currentValue) => {
					for (let exam in currentValue) {
						accumulator.push(`(${currentValue[exam].kskmdm})${currentValue[exam].kskmmc}`, currentValue[exam].cksm)
					}
					return accumulator
				}, [`(${subject.zydm})${subject.zymc}`, `(${subject.yxsdm})${subject.yxsmc}`, subject.ksfsmc, subject.xxfs, `(${subject.yjfxdm})${subject.yjfxmc}`, subject.tydxs, subject.jsggjh, subject.zdjs, subject.nzsrsstr, subject.zybz]))
			}
			if (!subjects.nextPageAvailable) {
				break
			}
		}
		console.log(major.zymc)
	}
	if (!majors.nextPageAvailable) {
		break
	}
}
workbook.xlsx.writeFile('国科.xlsx')
