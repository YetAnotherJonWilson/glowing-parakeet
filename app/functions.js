async function addNewHostname(location, newHostname) {
  // add new hostname only needs to update program.json
  // something like the following
  const url = new URL('http://localhost:3000/add-branch')
  const reqBody = JSON.stringify({
    location: location,
    newHostname: newHostname,
  })
  let data = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: reqBody,
  })
  console.log('data', data)
}

async function editName() {
  const targetPencil = document.querySelector('#edit-program-name')
  targetPencil.classList.add('hidden')

  const targetName = document.querySelector('#program-name')
  const placeholder = targetName.innerHTML

  const inputName = document.createElement('input')
  inputName.setAttribute('type', 'text')
  inputName.setAttribute('id', 'edit name')
  inputName.setAttribute('name', 'edit name')
  inputName.setAttribute('size', '20')
  inputName.setAttribute('placeholder', placeholder)
  inputName.classList.add('border', 'border-solid', 'border-black')

  targetName.replaceWith(inputName)

  inputName.focus()
  inputName.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      setName(inputName.value)
      inputName.replaceWith(targetName)
      location.reload()
    }
  })
}

async function setName(value) {
  const url = new URL('http://localhost:3000/program-name')
  const reqBody = JSON.stringify({ name: value })
  let data = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: reqBody,
  })
}

function openAddHostnameDialog(location) {
  const hostnameDialog = document.querySelector('#add-new-hostname')
  hostnameDialog.querySelector('span#new-hostname-location').innerHTML =
    location
  const newHostnameInput = document.querySelector('#new-hostname-name')
  newHostnameInput.value = ''
  newHostnameInput.addEventListener('keyup', (e) => {
    e.preventDefault()
    if (e.key === 'Enter') {
      const newHostname = newHostnameInput.value
      closeAddHostNameDialog()
      addNewHostname(location, newHostname)
    }
  })
  hostnameDialog.classList.toggle('hidden')
}

async function addAttributes(state, list) {
  const url = new URL('http://localhost:3000/add-attributes')
  const reqBody = JSON.stringify({
    state: state,
    list: list,
  })
  let data = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: reqBody,
  })
  console.log('data', data)
}

function openAddAttributesDialog() {
  document.querySelector('#main').classList.add('opacity-15')
  document.querySelector('#attribute-selector').classList.toggle('hidden')
}

function closeAddHostNameDialog() {
  document.querySelector('#main').classList.remove('opacity-15')
  document.querySelector('#add-new-hostname').classList.toggle('hidden')
}

async function updateChecked(hostname, method, attribute, pv, av, checked) {
  const url = new URL('http://localhost:3000/update-checked')
  const reqBody = JSON.stringify({
    hostname,
    method,
    attribute,
    pv,
    av,
    checked,
  })
  let data = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: reqBody,
  })
  console.log('data', data)
}
