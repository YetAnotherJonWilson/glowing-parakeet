import program from './program.json' assert { type: 'json' }
import vectorsMap from './vectorsMap.json' assert { type: 'json' }

const state = {
  table: 'none',
  method: 'GET',
  getAttributes: [],
  postAttributes: [],
  putAttributes: [],
  deleteAttributes: [],
  selectedAttribute: '',
  selectedPV: '',
  selectedAV: '',
}

function updateState(key, value) {
  if (key === 'table') {
    state.table = value

    for (let i = 0; i < program.tree.length; i++) {
      if (value === program.tree[i].hostname) {
        state.getAttributes = program.tree[i].GET
      }
    }
  }
  if (key === 'method') {
    state.method = value
    switch (value) {
      case 'GET':
        for (let i = 0; i < program.tree.length; i++) {
          if (state.table === program.tree[i].hostname) {
            state.getAttributes = program.tree[i].GET
          }
        }
        break
      case 'POST':
        for (let i = 0; i < program.tree.length; i++) {
          if (state.table === program.tree[i].hostname) {
            state.postAttributes = program.tree[i].POST
          }
        }
        break
      case 'PUT':
        for (let i = 0; i < program.tree.length; i++) {
          if (state.table === program.tree[i].hostname) {
            state.putAttributes = program.tree[i].PUT
          }
        }
        break
      case 'DELETE':
        for (let i = 0; i < program.tree.length; i++) {
          if (state.table === program.tree[i].hostname) {
            state.deleteAttributes = program.tree[i].DELETE
          }
        }
    }
  }
  if (key === 'selectedAttribute') {
    state.selectedAttribute = value
  }
  if (key === 'selectedPV') {
    state.selectedPV = value
  }
  if (key === 'selectedAV') {
    state.selectedAV === value
  }
}

// add the program name to the header
;(function () {
  document.querySelector('#program-name').innerHTML = program.name
})()

// add the program's current hostnames, with their attributes tables, to the tree
;(function () {
  const topOfList = document.querySelector('#top-of-list')
  let hostnameList = program.tree
  for (let i = hostnameList.length; i > 0; i--) {
    const newHostname = document.createElement('div')
    const newAttributesTable = document.createElement('attributes-table')

    // attrsSpan replaces the default list of attributes inside the template's element <slot name="attrs">
    const attrsSpan = document.createElement('span')
    const attrsDiv = document.createElement('div')
    attrsDiv.setAttribute('id', `${hostnameList[i - 1].hostname}-attrsList`)
    attrsSpan.setAttribute('slot', 'attrs')
    attrsSpan.append(attrsDiv)

    // create elements to replace PV and AV template slots
    const pvs = document.createElement('span')
    pvs.setAttribute('id', `${hostnameList[i - 1].hostname}-pvs-list`)
    pvs.setAttribute('slot', 'PVs')
    const avs = document.createElement('span')
    avs.setAttribute('id', `${hostnameList[i - 1].hostname}-avs-list`)
    avs.setAttribute('slot', 'AVs')

    // the next four spans with slots named for their HTTP methods will replace the template's GET/PUT/POST/DELETE slots
    // start with GET
    const getMethod = document.createElement('span')
    getMethod.setAttribute('slot', 'getMethod')
    getMethod.classList.add('font-bold', 'text-indigo-600', 'p-1', 'get-method')
    getMethod.innerHTML = 'GET'
    getMethod.addEventListener('click', () => {
      selectMethod(hostnameList[i - 1].hostname, 'GET')
      getSelectedMethodsAttributes(attrsDiv, 'get')
    })

    // add POST
    const postMethod = document.createElement('span')
    postMethod.setAttribute('slot', 'postMethod')
    postMethod.classList.add(
      'font-bold',
      'text-indigo-300',
      'p-1',
      'post-method'
    )
    postMethod.innerHTML = 'POST'
    postMethod.addEventListener('click', () => {
      selectMethod(hostnameList[i - 1].hostname, 'POST')
      getSelectedMethodsAttributes(attrsDiv, 'post')
    })

    // add PUT
    const putMethod = document.createElement('span')
    putMethod.setAttribute('slot', 'putMethod')
    putMethod.classList.add('font-bold', 'text-indigo-300', 'p-1', 'put-method')
    putMethod.innerHTML = 'PUT'
    putMethod.addEventListener('click', () => {
      selectMethod(hostnameList[i - 1].hostname, 'PUT')
      getSelectedMethodsAttributes(attrsDiv, 'put')
    })

    // add DELETE
    const deleteMethod = document.createElement('span')
    deleteMethod.setAttribute('slot', 'deleteMethod')
    deleteMethod.classList.add(
      'font-bold',
      'text-indigo-300',
      'p-1',
      'delete-method'
    )
    deleteMethod.innerHTML = 'DELETE'
    deleteMethod.addEventListener('click', () => {
      selectMethod(hostnameList[i - 1].hostname, 'DELETE')
      getSelectedMethodsAttributes(attrsDiv, 'delete')
    })

    newAttributesTable.setAttribute('id', hostnameList[i - 1].hostname)
    newAttributesTable.insertAdjacentElement('afterbegin', deleteMethod)
    newAttributesTable.insertAdjacentElement('afterbegin', putMethod)
    newAttributesTable.insertAdjacentElement('afterbegin', postMethod)
    newAttributesTable.insertAdjacentElement('afterbegin', getMethod)
    newAttributesTable.insertAdjacentElement('afterbegin', attrsSpan)
    newAttributesTable.insertAdjacentElement('afterbegin', pvs)
    newAttributesTable.insertAdjacentElement('afterbegin', avs)
    newAttributesTable.classList.add('hidden')
    const addBranch = document.createElement('span')
    addBranch.innerHTML = ' &#x2B;'
    addBranch.addEventListener('click', () => {
      openAddHostnameDialog(hostnameList[i - 1].hostname)
    })
    newHostname.innerHTML = hostnameList[i - 1].hostname
    newHostname.insertAdjacentElement('beforeend', addBranch)
    newHostname.classList.add(
      'asset',
      'text-2xl',
      'font-bold',
      'text-indigo-700'
    )
    topOfList.insertAdjacentElement('afterend', newAttributesTable)
    topOfList.insertAdjacentElement('afterend', newHostname)
  }
})()

// add toggle functionality to all hostnames in the tree
const toggle = document.getElementsByClassName('asset')
for (let i = 0; i < toggle.length; i++) {
  toggle[i].addEventListener('click', function (e) {
    // only toggle if the hostname is clicked, not the plus sign next to it
    if (e.target.tagName !== 'SPAN') {
      const newId = e.target.innerHTML.split('<span>')[0]
      const tableToShowHide = document.getElementById(newId)
      // if it is not hidden, hide it, else hide all others, and then unhide this one
      if (!tableToShowHide.classList.contains('hidden')) {
        tableToShowHide.classList.add('hidden')
        updateState('table', 'none')
      } else {
        const allAttributeTables = document.querySelectorAll('attributes-table')
        for (let i = 0; i < allAttributeTables.length; i++) {
          if (!allAttributeTables[i].classList.contains('hidden')) {
            allAttributeTables[i].classList.add('hidden')
          }
        }
        // first populate the attributes list for the get method (selected by default)
        updateState('table', newId)
        const attrsDiv = document.getElementById(`${newId}-attrsList`)
        getSelectedMethodsAttributes(attrsDiv, 'get')
        tableToShowHide.classList.remove('hidden')
      }
    }
  })
}

// populate the selectable url attributes list
const attributesList = document.querySelector('#attributes-list-header')
const listDiv = document.createElement('div')
listDiv.classList.add('flex', 'flex-wrap')
listDiv.setAttribute('id', 'attributes-list')
attributesList.insertAdjacentElement('afterend', listDiv)
const totalAttributes = Object.keys(vectorsMap.Attributes)
for (let i = 0; i < totalAttributes.length; i++) {
  const nextAttribute = document.createElement('button')
  nextAttribute.innerHTML = totalAttributes[i]
  nextAttribute.classList.add('ml-4', 'mt-4', 'font-bold', 'text-slate-800')
  nextAttribute.addEventListener('click', (e) => {
    if (e.target.classList.contains('text-slate-800')) {
      e.target.classList.remove('text-slate-800')
      e.target.classList.add('text-green-700')
      e.target.classList.add('text-xl')
    } else if (e.target.classList.contains('text-green-700')) {
      e.target.classList.remove('text-green-700')
      e.target.classList.add('text-red-700')
    } else if (e.target.classList.contains('text-red-700')) {
      e.target.classList.remove('text-red-700')
      e.target.classList.remove('text-xl')
      e.target.classList.add('text-slate-800')
    }
  })
  listDiv.insertAdjacentElement('beforeend', nextAttribute)
}

// add Close Dialog function to Add Attributes OK button
;(function () {
  document.querySelector('#add-attributes-ok').addEventListener('click', () => {
    closeAddAttributesDialog()
  })
})()

function selectMethod(hostname, method) {
  // when a GET/POST/PUT/DELETE method is clicked, we display the attributes list for that method, *for that hostname*
  // first we select the template by hostname
  let template = document.getElementById(hostname)

  // before highlighting the currently selected HTTP Method, set them all to their default color
  let getText = template.querySelector('span.get-method')
  getText.classList.remove('text-indigo-600')
  getText.classList.add('text-indigo-300')
  let postText = template.querySelector('span.post-method')
  postText.classList.remove('text-indigo-600')
  postText.classList.add('text-indigo-300')
  let putText = template.querySelector('span.put-method')
  putText.classList.remove('text-indigo-600')
  putText.classList.add('text-indigo-300')
  let deleteText = template.querySelector('span.delete-method')
  deleteText.classList.remove('text-indigo-600')
  deleteText.classList.add('text-indigo-300')

  switch (method) {
    case 'GET':
      updateState('method', 'GET')
      getText.classList.remove('text-indigo-300')
      getText.classList.add('text-indigo-600')
      break
    case 'POST':
      updateState('method', 'POST')
      postText.classList.remove('text-indigo-300')
      postText.classList.add('text-indigo-600')
      break
    case 'PUT':
      updateState('method', 'PUT')
      putText.classList.remove('text-indigo-300')
      putText.classList.add('text-indigo-600')
      break
    case 'DELETE':
      updateState('method', 'DELETE')
      deleteText.classList.remove('text-indigo-300')
      deleteText.classList.add('text-indigo-600')
  }
}

function closeAddAttributesDialog() {
  document.querySelector('#main').classList.remove('opacity-15')
  const attributesList = document.querySelector('#attributes-list')
  const atts = attributesList.children
  const changeList = []
  for (let i = 0; i < atts.length; i++) {
    if (atts[i].classList.contains('text-green-700')) {
      const item = []
      item.push('add')
      item.push(atts[i].innerHTML)
      changeList.push(item)
    } else if (atts[i].classList.contains('text-red-700')) {
      const item = []
      item.push('remove')
      item.push(atts[i].innerHTML)
      changeList.push(item)
    }
  }
  addAttributes(state, changeList)
  document.querySelector('#attribute-selector').classList.toggle('hidden')
}

function getSelectedMethodsAttributes(attrsDiv, method) {
  let attrsList = []
  let newAttrs = []
  switch (method) {
    case 'get':
      for (let i = 0; i < state.getAttributes.length; i++) {
        newAttrs.push(state.getAttributes[i].attribute)
      }
      attrsList = newAttrs
      break
    case 'post':
      for (let i = 0; i < state.postAttributes.length; i++) {
        newAttrs.push(state.postAttributes[i].attribute)
      }
      attrsList = newAttrs
      break
    case 'put':
      for (let i = 0; i < state.putAttributes.length; i++) {
        newAttrs.push(state.putAttributes[i].attribute)
      }
      attrsList = newAttrs
      break
    case 'delete':
      for (let i = 0; i < state.deleteAttributes.length; i++) {
        newAttrs.push(state.deleteAttributes[i].attribute)
      }
      attrsList = newAttrs
  }
  const newAttrsContainer = document.createElement('div')
  for (let i = 0; i < attrsList.length; i++) {
    const attrDiv = document.createElement('div')
    attrDiv.innerHTML = attrsList[i]
    attrDiv.addEventListener('click', (e) => {
      updateState('selectedAttribute', e.target.innerHTML)
      populateAttributeDetails(e)
    })
    newAttrsContainer.append(attrDiv)
  }
  attrsDiv.replaceChildren(newAttrsContainer)
}

function populateAttributeDetails(e) {
  const clickedAttribute = e.target.innerHTML
  let methodAttributes = state.getAttributes
  switch (state.method) {
    case 'GET':
      for (let i = 0; i < methodAttributes.length; i++) {
        if (methodAttributes[i].attribute === clickedAttribute) {
          const PVListObjs = Object.keys(methodAttributes[i].PVList)
          const pvsSlot = document.getElementById(`${state.table}-pvs-list`)
          const avsSlot = document.getElementById(`${state.table}-avs-list`)
          const newPVsContainer = document.createElement('div')
          pvsSlot.replaceChildren(newPVsContainer)
          newPVsContainer.classList.add('mt-3')
          const newAVsContainer = document.createElement('div')
          avsSlot.replaceChildren(newAVsContainer)
          newAVsContainer.classList.add('mt-3')
          for (let j = 0; j < PVListObjs.length; j++) {
            const newPV = document.createElement('div')
            newPV.innerHTML = PVListObjs[j]
            newPVsContainer.append(newPV)
            let PVClass = PVListObjs[j].replace(/\s+/g, '')
            // Hide/show list of related AV's and update selected PV in state when clicked
            newPV.addEventListener('click', (e) => {
              const allAVs = document.getElementsByClassName(PVClass)
              console.log('allAVs', allAVs)
              updateState('selectedPV', e.target.innerHTML)
              for (let i = 0; i < allAVs.length; i++) {
                allAVs[i].classList.toggle('hidden')
              }
              console.log('after selecting a PV, state is now:', state)
            })
            const AVListObjs = methodAttributes[i].PVList[PVListObjs[j]]
            for (let k = 0; k < AVListObjs.length; k++) {
              const newAV = document.createElement('div')
              newAV.classList.add(PVClass, 'hidden')
              const AV = Object.keys(AVListObjs[k])[0]
              const AVState = AVListObjs[k][AV]
              const newAVInput = document.createElement('input')
              newAVInput.setAttribute('type', 'checkbox')
              newAVInput.setAttribute('name', AV)
              newAVInput.setAttribute('id', `${AV}-checkbox`)
              let isChecked = AVState !== 'unchecked' ? true : false
              if (isChecked) {
                newAVInput.setAttribute('checked', true)
              }
              newAVInput.classList.add('ml-2')
              newAVInput.addEventListener('change', (e) => {
                updateChecked(
                  state.table,
                  state.method,
                  state.selectedAttribute,
                  state.selectedPV,
                  e.target.name,
                  e.target.checked
                )
              })
              const newAVLabel = document.createElement('label')
              newAVLabel.setAttribute('for', AV)
              newAVLabel.innerHTML = AV
              newAV.append(newAVLabel)
              newAV.append(newAVInput)
              newAVsContainer.append(newAV)
            }
          }
        }
      }
      break
    case 'POST':
      methodAttributes = state.postAttributes
      for (let i = 0; i < methodAttributes.length; i++) {
        if (methodAttributes[i].attribute === clickedAttribute) {
          const PVListObjs = Object.keys(methodAttributes[i].PVList)
          const pvsSlot = document.getElementById(`${state.table}-pvs-list`)
          const avsSlot = document.getElementById(`${state.table}-avs-list`)
          const newPVsContainer = document.createElement('div')
          pvsSlot.replaceChildren(newPVsContainer)
          newPVsContainer.classList.add('mt-3')
          const newAVsContainer = document.createElement('div')
          avsSlot.replaceChildren(newAVsContainer)
          newAVsContainer.classList.add('mt-3')
          for (let j = 0; j < PVListObjs.length; j++) {
            const newPV = document.createElement('div')
            newPV.innerHTML = PVListObjs[j]
            newPVsContainer.append(newPV)
            let PVClass = PVListObjs[j].replace(/\s+/g, '')
            // Hide/show list of related AV's and update selected PV in state when clicked
            newPV.addEventListener('click', (e) => {
              const allAVs = document.getElementsByClassName(PVClass)
              console.log('allAVs', allAVs)
              updateState('selectedPV', e.target.innerHTML)
              for (let i = 0; i < allAVs.length; i++) {
                allAVs[i].classList.toggle('hidden')
              }
              console.log('after selecting a PV, state is now:', state)
            })
            const AVListObjs = methodAttributes[i].PVList[PVListObjs[j]]
            for (let k = 0; k < AVListObjs.length; k++) {
              const newAV = document.createElement('div')
              newAV.classList.add(PVClass, 'hidden')
              const AV = Object.keys(AVListObjs[k])[0]
              const AVState = AVListObjs[k][AV]
              const newAVInput = document.createElement('input')
              newAVInput.setAttribute('type', 'checkbox')
              newAVInput.setAttribute('name', AV)
              newAVInput.setAttribute('id', `${AV}-checkbox`)
              let isChecked = AVState !== 'unchecked' ? true : false
              if (isChecked) {
                newAVInput.setAttribute('checked', true)
              }
              newAVInput.classList.add('ml-2')
              newAVInput.addEventListener('change', (e) => {
                updateChecked(
                  state.table,
                  state.method,
                  state.selectedAttribute,
                  state.selectedPV,
                  e.target.name,
                  e.target.checked
                )
              })
              const newAVLabel = document.createElement('label')
              newAVLabel.setAttribute('for', AV)
              newAVLabel.innerHTML = AV
              newAV.append(newAVLabel)
              newAV.append(newAVInput)
              newAVsContainer.replaceChildren(newAV)
            }
          }
        }
      }
      break
      break
    case 'PUT':
      methodAttributes = state.putAttributes
      for (let i = 0; i < methodAttributes.length; i++) {
        if (methodAttributes[i].attribute === clickedAttribute) {
          const PVListObjs = Object.keys(methodAttributes[i].PVList)
          const pvsSlot = document.getElementById(`${state.table}-pvs-list`)
          const avsSlot = document.getElementById(`${state.table}-avs-list`)
          const newPVsContainer = document.createElement('div')
          pvsSlot.replaceChildren(newPVsContainer)
          newPVsContainer.classList.add('mt-3')
          const newAVsContainer = document.createElement('div')
          avsSlot.replaceChildren(newAVsContainer)
          newAVsContainer.classList.add('mt-3')
          for (let j = 0; j < PVListObjs.length; j++) {
            const newPV = document.createElement('div')
            newPV.innerHTML = PVListObjs[j]
            newPVsContainer.append(newPV)
            let PVClass = PVListObjs[j].replace(/\s+/g, '')
            // Hide/show list of related AV's and update selected PV in state when clicked
            newPV.addEventListener('click', (e) => {
              const allAVs = document.getElementsByClassName(PVClass)
              console.log('allAVs', allAVs)
              updateState('selectedPV', e.target.innerHTML)
              for (let i = 0; i < allAVs.length; i++) {
                allAVs[i].classList.toggle('hidden')
              }
              console.log('after selecting a PV, state is now:', state)
            })
            const AVListObjs = methodAttributes[i].PVList[PVListObjs[j]]
            for (let k = 0; k < AVListObjs.length; k++) {
              const newAV = document.createElement('div')
              newAV.classList.add(PVClass, 'hidden')
              const AV = Object.keys(AVListObjs[k])[0]
              const AVState = AVListObjs[k][AV]
              const newAVInput = document.createElement('input')
              newAVInput.setAttribute('type', 'checkbox')
              newAVInput.setAttribute('name', AV)
              newAVInput.setAttribute('id', `${AV}-checkbox`)
              let isChecked = AVState !== 'unchecked' ? true : false
              if (isChecked) {
                newAVInput.setAttribute('checked', true)
              }
              newAVInput.classList.add('ml-2')
              newAVInput.addEventListener('change', (e) => {
                updateChecked(
                  state.table,
                  state.method,
                  state.selectedAttribute,
                  state.selectedPV,
                  e.target.name,
                  e.target.checked
                )
              })
              const newAVLabel = document.createElement('label')
              newAVLabel.setAttribute('for', AV)
              newAVLabel.innerHTML = AV
              newAV.append(newAVLabel)
              newAV.append(newAVInput)
              newAVsContainer.replaceChildren(newAV)
            }
          }
        }
      }
      break
      break
    case 'DELETE':
      methodAttributes = state.deleteAttributes
      for (let i = 0; i < methodAttributes.length; i++) {
        if (methodAttributes[i].attribute === clickedAttribute) {
          const PVListObjs = Object.keys(methodAttributes[i].PVList)
          const pvsSlot = document.getElementById(`${state.table}-pvs-list`)
          const avsSlot = document.getElementById(`${state.table}-avs-list`)
          const newPVsContainer = document.createElement('div')
          pvsSlot.replaceChildren(newPVsContainer)
          newPVsContainer.classList.add('mt-3')
          const newAVsContainer = document.createElement('div')
          avsSlot.replaceChildren(newAVsContainer)
          newAVsContainer.classList.add('mt-3')
          for (let j = 0; j < PVListObjs.length; j++) {
            const newPV = document.createElement('div')
            newPV.innerHTML = PVListObjs[j]
            newPVsContainer.append(newPV)
            let PVClass = PVListObjs[j].replace(/\s+/g, '')
            // Hide/show list of related AV's and update selected PV in state when clicked
            newPV.addEventListener('click', (e) => {
              const allAVs = document.getElementsByClassName(PVClass)
              console.log('allAVs', allAVs)
              updateState('selectedPV', e.target.innerHTML)
              for (let i = 0; i < allAVs.length; i++) {
                allAVs[i].classList.toggle('hidden')
              }
              console.log('after selecting a PV, state is now:', state)
            })
            const AVListObjs = methodAttributes[i].PVList[PVListObjs[j]]
            for (let k = 0; k < AVListObjs.length; k++) {
              const newAV = document.createElement('div')
              newAV.classList.add(PVClass, 'hidden')
              const AV = Object.keys(AVListObjs[k])[0]
              const AVState = AVListObjs[k][AV]
              const newAVInput = document.createElement('input')
              newAVInput.setAttribute('type', 'checkbox')
              newAVInput.setAttribute('name', AV)
              newAVInput.setAttribute('id', `${AV}-checkbox`)
              let isChecked = AVState !== 'unchecked' ? true : false
              if (isChecked) {
                newAVInput.setAttribute('checked', true)
              }
              newAVInput.classList.add('ml-2')
              newAVInput.addEventListener('change', (e) => {
                updateChecked(
                  state.table,
                  state.method,
                  state.selectedAttribute,
                  state.selectedPV,
                  e.target.name,
                  e.target.checked
                )
              })
              const newAVLabel = document.createElement('label')
              newAVLabel.setAttribute('for', AV)
              newAVLabel.innerHTML = AV
              newAV.append(newAVLabel)
              newAV.append(newAVInput)
              newAVsContainer.replaceChildren(newAV)
            }
          }
        }
      }
      break
  }
}
