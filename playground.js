"use strict";


const Playground = (function() {
	const gebi = (id) => { return document.getElementById(id) }
	const qsel = (sel) => { return document.querySelector(sel) }
	const qall = (sel) => { return document.querySelectorAll(sel) }
	let editor = undefined
	
	const init = function() {
		initForm()
		updateEditor()
	}

	const getDefaults = function() {
		const groups = ['Smileys & Emotion', 'Activities', 'Animals & Nature', 'Flags', 'Food & Drink', 'Objects', 'People & Body', 'Symbols', 'Travel & Places']
		return {
			groups: groups.slice(),
			names: groups.slice(),
			favorites: true,
			iconSize: '1.5rem',
			skinTone: 'neutral',
			topmenu: {
				search: false,
				skinTone: false,
				iconSize: false
			},
			showFallbacks: false
		}
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

	function DragDrop(cnt, cls) {
		const items = cnt.querySelectorAll(cls)
		const name = cnt.getAttribute('name')
		let dragged = undefined
		let allowDrop = undefined
		for (const item of items) {
			item.draggable = true
			item.ondragstart = function(e) {
				dragged = this
				e.dataTransfer.dropEffect = 'move'
				e.dataTransfer.effectAllowed = 'move'
				e.dataTransfer.setData('text/html', item.innerHTML)

				e.dataTransfer.setData('checked', item.querySelector('input[type="checkbox"]').checked)
				e.dataTransfer.setData('value', item.querySelector('input[type="text"]').value)

				//checked = item.querySelector('input[type="checkbox"]').checked
			}
			item.ondragover = function(e) {
				const el = document.elementFromPoint(e.clientX, e.clientY)
				e.preventDefault()
				const n = el.parentElement.parentElement.getAttribute('name') //this.getAttribute('data-name')
				allowDrop = n === name
			}
			item.ondrop = function(e) {
				e.preventDefault()
				if (dragged !== item && allowDrop) {
					dragged.innerHTML = item.innerHTML
					item.innerHTML = e.dataTransfer.getData('text/html')
				
					item.querySelector('input[type="checkbox"]').checked = e.dataTransfer.getData('checked')
					item.querySelector('input[type="text"]').value = e.dataTransfer.getData('value')

					//item.querySelector('input[type="checkbox"]').checked = checked
				}
			}
			item.ondragenter = function(e) {
				item.classList.add('active')
			}
			item.ondragleave = function() {
				item.classList.remove('active')
			}
			item.ondragend = function() {
				for (const item of items) { 
					item.classList.remove('active')
				}
				initGroups()
			}
		} //(cnt, name, dragged, items, checked, allowDrop)
	}

/*
	const initGroups = function() {
		const cnt = qsel('div[name="groups-names"]')
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
*/
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
		new DragDrop(div, '.item-sortable')

		//--------------------------------------------
/*
		const cnt = qsel('div[name="groups-names"]')
		//const groups = ['Smileys & Emotion', 'Activities', 'Animals & Nature', 'Flags', 'Food & Drink', 'Objects', 'People & Body', 'Symbols', 'Travel & Places']
		for (const group of groups) {
			const html = `
				<div class="item-sortable bb" style="display:table-row;">
					<label class="fieldset-item" style="display: table-cell; ">
						<input type="checkbox" name="${group}" checked>${group}</label>
					</label>
					<input class="fieldset-item" type="text" name="${group}" value="${group}" style="display:table-cell;" >
				</div>`
			cnt.insertAdjacentHTML('beforeend', html)
		}
*/
		//groups
		initGroups()
		//new DragDrop(cnt, '.bb')

		//topmenu
		qsel('#option-topmenu div').querySelectorAll('input[type="checkbox"]').forEach(function(input) {
			input.onclick = function() {
				updateEditor()
			}
		})
		new DragDrop(qsel('#option-topmenu div'), '.item-sortable')

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
			//s = s.substr(1, s.length - 2)
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
		//console.log(options)
		updateOptions(options)
		//return options
		initEditor(options)
	}

	const initEditor = function(opt) {
		opt = opt || {}
		opt.useTag = 'span'
		const options = {
			mode: 'classic',
			width: '100%',
			height: 'auto',
			minHeight : '40vh',
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

