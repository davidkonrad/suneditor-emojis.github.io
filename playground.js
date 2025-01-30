"use strict";


const Playground = (function() {
	const gebi = (id) => { return document.getElementById(id) }
	const qsel = (sel) => { return document.querySelector(sel) }
	const qall = (sel) => { return document.querySelectorAll(sel) }
	const default_iconSize = '1.7rem'
	let editor = undefined
	
	const init = function() {
		initForm()
		updateEditor()
	}

	const storage = function(o) {
		const name = (s) => 'suneditor-emoji_' + s
		if (typeof o === 'string') {
			return localStorage.getItem(name(o))
		}
		if (typeof o === 'object') {
			const key = Object.keys(o)[0]
			if (!o[key]) return localStorage.removeItem(name(key)) 
			const val = typeof o[key] === 'string' ? o[key] : JSON.stringify(o[key])
			return localStorage.setItem(name(key), val)
		}
	}

	const initOrderable = function(cnt, name) {
		const items = cnt.querySelectorAll('.item-sortable')
		let dragged = undefined
		let allowDrop = undefined
		for (const item of items) {
			item.draggable = true
			item.name = name
			item.ondragstart = function(e) {
				dragged = this
				e.dataTransfer.dropEffect = 'move'
				e.dataTransfer.effectAllowed = 'move'
				e.dataTransfer.setData('text/html', item.innerHTML)
				if (item.name === 'groups-names') {
					e.dataTransfer.setData('checked', item.querySelector('input[type="checkbox"]').checked)
					e.dataTransfer.setData('value', item.querySelector('input[type="text"]').value)
				}
			}
			item.ondragover = function(e) {
				e.preventDefault()
				allowDrop = true //!!?? must find a way to handle illegal drops
			}
			item.ondrop = function(e) {
				e.preventDefault()
				if (dragged !== item && allowDrop) {
					dragged.innerHTML = item.innerHTML
					item.innerHTML = e.dataTransfer.getData('text/html')
					if (item.name === 'groups-names') {
						item.querySelector('input[type="checkbox"]').checked = e.dataTransfer.getData('checked')
						item.querySelector('input[type="text"]').value = e.dataTransfer.getData('value')
					}
				}
			}
			item.ondragenter = function(e) {
				item.classList.add('active')
			}
			item.ondragleave = function() {
				item.classList.remove('active')
			}
			item.ondragend = function() {
				for (const item of items) item.classList.remove('active')
				initGroups()
				updateEditor()
			}
		}
	}

	const initGroups = function() {
		const cnt = qsel('#option-groups-names div')
		cnt.querySelectorAll('input[type="checkbox"]').forEach(function(input) {
			input.onclick = function() {
				const name = this.parentElement.nextElementSibling 
				if (!this.checked) {
					name.setAttribute('disabled', 'disabled')
					this.parentElement.style.color = 'rgb(170, 170, 170)'
				} else {
					name.removeAttribute('disabled')
					this.parentElement.style.color = '#333'
				}
				updateEditor()
			}
		})
		cnt.querySelectorAll('input[type="text"]').forEach(function(input) {
			input.onfocus = function() {
				this.oldValue = this.value
				this.parentElement.draggable = false
			}
			input.onblur = function() {
				this.parentElement.draggable = true
				if (this.oldValue !== this.value) updateEditor()
			}
		})
	}

	const initForm = function() {
		const groups = ['Smileys & Emotion', 'Activities', 'Animals & Nature', 'Flags', 'Food & Drink', 'Objects', 'People & Body', 'Symbols', 'Travel & Places']

		const div = gebi('option-groups-names').querySelector('div')
		for (const group of groups) {
			const html = `
				<div class="item-sortable" style="display:table-row;" title="${group}">
					<label class="fieldset-item" style="display:table-cell;cursor:pointer">
						<input type="checkbox" name="${group}" checked>${group}</label>
					</label>
					<input class="fieldset-item" type="text" name="${group}" value="${group}" style="display:table-cell;" spellcheck="false">
				</div>`
			div.insertAdjacentHTML('beforeend', html)
		}
		initOrderable(div, 'groups-names')
		initGroups()

		qsel('#option-topmenu div').querySelectorAll('input[type="checkbox"]').forEach(function(input) {
			input.onclick = function() {
				updateEditor()
			}
		})
		initOrderable(qsel('#option-topmenu div'), 'topmenu')

		qsel('#option-recent input').onclick = function() {
			updateEditor()
		}

		const updateCurrent = function(current) {
			gebi('iconsize-current').innerText = '(' +  current +')'
		}
		const select = gebi('select-iconsize')
		let size = 0.3
		while (size < 5) {
			const option = document.createElement('option')
			const fs = parseFloat(size).toPrecision(2) + 'rem'
			option.value = fs
			option.style.fontSize = fs
			option.innerText = '😊'
			option.title = fs
			if (fs === default_iconSize) {
				option.selected = true
				updateCurrent(fs)
			}			
			select.appendChild(option)
			size += 0.2
		}
		select.onchange = function() {
			updateCurrent(this.value)
			updateEditor()
		}		

		qall('#option-skinTone input[name="skinTone"]').forEach(function(input) {
			input.onclick = function() {
				updateEditor()
			}
		})

		qsel('#option-showFallbacks input').onclick = function() {
			updateEditor()
		}

		qsel('#option-tagName select').onchange = function() {
			updateEditor()
		}

		qall('aside details').forEach(function(d) {
			d.ontoggle = function() {
				storage({ [this.id]: !this.open ? 'closed' : undefined })
			}
			if (storage(d.id)) d.open = false
		})
	}

	const updateOptions = function(options) {
		let s = ''
		if (options) {
			const obj = { emojis: options }
			s = JSON.stringify(obj, null, '  ')
			s = s.replace(/"([^"]+)":/g, '$1:') //https://stackoverflow.com/a/11233515/1407478
		}
		gebi('options').innerText = s.trimLeft()
	}

	const updateEditor = function() {
		const options = {
			groups: [],
			names: [],
			topmenu: {},
		}
		qsel('#option-groups-names div').querySelectorAll('input[type="checkbox"]').forEach(function(input) {
			if (input.checked) {
				options.groups.push(input.name)
				options.names.push(input.parentElement.nextElementSibling.value)
			}
		})
		qsel('#option-topmenu div').querySelectorAll('input[type="checkbox"]').forEach(function(input) {
			if (input.checked) {
				options.topmenu[input.name] = true
			}
		})
		options.skinTone = qsel('#option-skinTone input[name="skinTone"]:checked').value
		options.iconSize = qsel('#option-iconSize select').value
		options.recent = qsel('#option-recent input').checked
		options.showFallbacks = qsel('#option-showFallbacks input').checked
		options.tagName = qsel('#option-tagName select').value

		updateOptions(options)
		initEditor(options)
	}

	const initEditor = function(opt) {
		opt = opt || {}
		opt.useTag = 'span'
		const options = {
			mode: 'classic',
			width: '100%',
			height: 'auto',
			minHeight : '30vh',
			plugins: [emojisPlugin],
			buttonList: [
				['font', 'fontSize', 'formatBlock'], ['emojis'],
				['bold', 'underline', 'italic', 'strike', 'removeFormat'],
				['fontColor', 'hiliteColor'], 
			],
			defaultStyle: "font-size:1.5rem;"
		}
		options.emojis = opt 
		if (editor) editor.destroy()
		editor = SUNEDITOR.create('editor', options)
		editor.setContents('<p>Lorem ipsum</p>')
		qsel('.sun-editor-editable').tabIndex = -1
		qsel('.sun-editor-editable').focus()
	}

	return {
		init
	}

})()

window.addEventListener("DOMContentLoaded", function() {
	Playground.init()
})	

