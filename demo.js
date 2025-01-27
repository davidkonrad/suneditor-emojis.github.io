"use strict";

const Demo = (function() {
	const gebi = (id) => { return document.getElementById(id) }
	const qsel = (sel) => { return document.querySelector(sel) }
	const qall = (sel) => { return document.querySelectorAll(sel) }

	let editor = undefined
	let form = undefined	

	const init = function() {
		form = document.getElementById('form')
		initForm()
		initEditor()
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

	const getFieldSet = function(legend) {
		const f = document.createElement('fieldset')
		const l = document.createElement('legend')
		l.innerText = legend
		f.appendChild(l)
		form.appendChild(f)
		return f
	}

	const getCheckbox = function(name, label, fieldset) {
		const l = document.createElement('label')
		const c = document.createElement('input')
		c.type = 'checkbox'
		c.name = name
		l.appendChild(c)
		l.appendChild(document.createTextNode(label))
		fieldset.appendChild(l)
	}

	const getRadio = function(value, label, name, fieldset) {
		const l = document.createElement('label')
		const c = document.createElement('input')
		c.type = 'radio'
		c.value = value
		c.name = name
		l.appendChild(c)
		l.appendChild(document.createTextNode(label))
		fieldset.appendChild(l)
	}

	const initForm = function() {
		const cnt = qsel('div[name="groups-names"]')
		const groups = ['Smileys & Emotion', 'Activities', 'Animals & Nature', 'Flags', 'Food & Drink', 'Objects', 'People & Body', 'Symbols', 'Travel & Places']
		for (const group of groups) {
			const html = `
				<div class="item-sortable" style="display:table-row;">
					<label class="fieldset-item" style="display: table-cell; ">
						<input type="checkbox" name="${group}" checked>${group}</label>
					</label>
					<input class="fieldset-item" type="text" name="${group}" value="${group}" style="display:table-cell;" >
				</div>`
			cnt.insertAdjacentHTML('beforeend', html)
		}
		initDragDrop()
		cnt.querySelectorAll('input[type="checkbox"]').forEach(function(input) {
			input.onclick = function() {
				const name = this.parentElement.nextElementSibling //querySelector('input[type="text"]')
				if (!this.checked) {
					name.setAttribute('disabled', 'disabled')
					this.parentElement.style.color = 'rgb(170, 170, 170)'
				} else {
					name.removeAttribute('disabled')
					this.parentElement.style.color = '#333'
				}
			}
		})
	}

/*
		qsel('form div[name="groups"]').querySelectorAll('input[type="checkbox"]').forEach(function(input) {
			input.onclick = function() {
				const name = qsel('div[name="names"]').querySelector('input[name="' + this.name +'"]')
				if (!this.checked) {
					name.setAttribute('disabled', 'disabled')
					this.parentElement.style.color = 'rgb(170, 170, 170)'
				} else {
					name.removeAttribute('disabled')
					this.parentElement.style.color = '#333'
				}
			}
		})
		qall('form input').forEach(function(input) {
			input.onchange = function() {
				updateEditor()
			}
		})
*/
//	}

	const updateEditor = function() {
		const ndiv = qsel('form div[name="names"]')
		const checks = qsel('form div[name="groups"]').querySelectorAll('input[type="checkbox"]')
		const groups = []
		const names = []
		checks.forEach(function(check) {
			if (check.checked) {
				groups.push(check.name)
				names.push(ndiv.querySelector('input[name="' + check.name + '"]').value)
			}
		})
		console.log(groups, names)
	}

	const initDragDrop = function() {
		const items = qall('.item-sortable')
		let dragged = undefined

		for (const s of items) {
			s.draggable = true

		s.ondragstart = e => {
      dragged = s;
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", s.innerHTML);
    };
 
    s.ondragover = e => e.preventDefault();
 
    s.ondrop = e => {
      e.preventDefault();
      if (dragged != s) {
        dragged.innerHTML = s.innerHTML;
        s.innerHTML = e.dataTransfer.getData("text/html");
      }
    };
 
    // (C5) NOT REALLY IMPORTANT - COSMETICS
    s.ondragenter = () => s.classList.add("active");
    s.ondragleave = () => s.classList.remove("active");
    s.ondragend = () => {
      for (let it of items) { it.classList.remove("active"); }
    };
		}
  }
				
	const initEditor = function(opt) {
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
		options.emojis = opt ? Object.assign(getDefaults(), opt) : getDefaults()
		if (editor) editor.destroy()
		editor = SUNEDITOR.create('editor', options)
		editor.setContents('<p>Lorem ipsum</p>')
		document.querySelector('.sun-editor-editable').focus()
		let s = ''
		if (opt) {
			const obj = { emojis: opt }
			s = JSON.stringify(obj, null, '  ')
			s = s.replace(/\\/g, '')
			s = s.replace(/"([^"]+)":/g, '$1:') //https://stackoverflow.com/a/11233515/1407478
			s = s.substr(1, s.length - 2)
		}
		document.getElementById('options').innerText = s
	}

	return {
		init
	}

})()

window.addEventListener("DOMContentLoaded", function() {
	Demo.init()
})	

