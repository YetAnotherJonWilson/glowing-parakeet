import express from 'express'
import fs from 'fs'
import path from 'path'

const app = express()
const port = 3000

const directoryPath = process.argv[2]
const programPath = path.join(directoryPath, 'program.json')

app.get('/', (req, res) => {
  res.sendFile('./app/index.html', { root: '.' })
})

app.use(express.json())

app.get('/get-program', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  const obj = JSON.parse(fs.readFileSync(programPath, 'utf8'))
  res.json(JSON.stringify(obj))
})

app.post('/program-name', (req, res, next) => {
  const obj = JSON.parse(fs.readFileSync(programPath, 'utf8'))
  obj.name = req.body?.name
  let newObj = JSON.stringify(obj)
  fs.writeFile(programPath, newObj, 'utf8', () => {
    res.send('File written')
  })
})

app.post('/add-branch', (req, res, next) => {
  const obj = JSON.parse(fs.readFileSync(programPath, 'utf8'))

  // FIRST, make sure req?.body.newHostname is not an empty string
  if (!req?.body?.newHostname || req?.body.newHostname === '') {
    res.status(500)
  }
  // SECOND look for any dupes in obj.tree[i].hostname
  for (let i = 0; i < obj.tree.length; i++) {
    if (req.body.newHostname === obj.tree[i].hostname) {
      res.status(500)
    }
  }
  // determine where to put the new hostname
  let newHostnameIndex = 0
  if (req.body.location !== 'top') {
    for (let i = 0; i < obj.tree.length; i++) {
      if (obj.tree[i].hostname === req.body.location) {
        newHostnameIndex = i + 1
        i = i + 1000
      }
    }
  }
  //create an object for the new hostname
  const newHostnameObject = {}
  newHostnameObject.hostname = req.body.newHostname
  newHostnameObject.GET = []
  newHostnameObject.PUT = []
  newHostnameObject.POST = []
  newHostnameObject.DELETE = []

  //insert the new hostname object at the right index
  const oldTree = obj.tree
  const newObjTree = [
    ...oldTree.slice(0, newHostnameIndex),
    newHostnameObject,
    ...oldTree.slice(newHostnameIndex),
  ]
  obj.tree = newObjTree
  let newObj = JSON.stringify(obj)
  fs.writeFile(programPath, newObj, 'utf8', () => {
    res.send('File written')
  })
})

app.post('/add-attributes', (req, res, next) => {
  const obj = JSON.parse(fs.readFileSync(programPath, 'utf8'))
  const vectorsMap = JSON.parse(
    fs.readFileSync('./app/vectorsMap.json', 'utf8')
  )

  // FIRST get the right method from the branch and clone it
  // objTreeIndex will be used to know where to replace the old object with the new one
  let methodList = []
  let objTreeIndex = 1000
  for (let i = 0; i < obj.tree.length; i++) {
    if (obj.tree[i].hostname === req.body.state.table) {
      objTreeIndex = i
      // get the current array for the selected method
      methodList = obj.tree[i][req.body.state.method]
    }
  }
  // loop through req.body.list, for each item,
  // if it's add, check for dupes, then add
  // if it's subtract, find it then remove it
  for (let i = 0; i < req.body.list.length; i++) {
    if (req.body.list[i][0] === 'add') {
      // check for dupes
      let dupe = false
      for (let j = 0; j < methodList.length; j++) {
        if (methodList[j].attribute === req.body.list[i][1]) {
          dupe = true
        }
      }
      // if no dupe, add
      if (!dupe) {
        // create attribute object, and add it to methodList
        const newAttributeObj = {}
        newAttributeObj.attribute = req.body.list[i][1]
        newAttributeObj.notes = ''
        newAttributeObj.PVList = {}
        // 1. find attribute in vectorsMap, get its list of PVs
        // 2. for each PV, add it as a key, with the value empty array
        // 3. then get its list of AV's, and add each one in the form
        // {key  is AV name: value is "unchecked"}
        const vectorAttributes = Object.keys(vectorsMap.Attributes)
        let len = vectorAttributes.length
        for (let j = 0; j < len; j++) {
          if (vectorAttributes[j] === newAttributeObj.attribute) {
            const PVList = vectorsMap.Attributes[vectorAttributes[j]]
            for (let k = 0; k < PVList.length; k++) {
              const itemToAdd = PVList[k]
              newAttributeObj.PVList[itemToAdd] = []
              const allPVs = Object.keys(
                vectorsMap['Potential vulnerabilities']
              )
              let pvavs = vectorsMap['Potential vulnerabilities'][PVList[k]]
              for (let m = 0; m < pvavs.length; m++) {
                let newAV = {}
                newAV[pvavs[m]] = 'unchecked'
                newAttributeObj.PVList[itemToAdd].push(newAV)
              }
            }
          }
        }
        methodList.push(newAttributeObj)
      }
    } else if (req.body.list[i][0] === 'remove') {
      for (let j = 0; j < methodList.length; j++) {
        if (methodList[j].attribute === req.body.list[i][1]) {
          methodList.splice(j, 1)
        }
      }
    }
  }

  obj.tree[objTreeIndex][req.body.state.method] = methodList
  let newObj = JSON.stringify(obj)
  fs.writeFile(programPath, newObj, 'utf8', () => {
    res.send('File written')
  })
})

app.post('/update-checked', (req, res, next) => {
  const obj = JSON.parse(fs.readFileSync(programPath, 'utf8'))
  const body = req.body
  let methodArray = []
  let attrObj
  let PVKeys = []
  let methodArrayIndex = 0
  let PVIndex = 0
  let PVArray = []
  let treeIndex = 0
  // get the program json file
  // get the right branch
  // 1 get the object by hostname: use body.hostname
  // 2 get the method array: use body.method
  for (let i = 0; i < obj.tree.length; i++) {
    if (obj.tree[i].hostname === body.hostname) {
      treeIndex = i
      methodArray = obj.tree[i][body.method]
    }
  }
  // 3 get the correct attribute object by attribute value (methodArray[i].attribute === body.attribute)
  for (let i = 0; i < methodArray.length; i++) {
    if (methodArray[i].attribute === body.attribute) {
      methodArrayIndex = i
      attrObj = methodArray[i]
      PVKeys = Object.keys(attrObj.PVList)
    }
  }
  // 4 get the PV list of objects, and find the correct PV array (where object.key[i] === body.pv)
  for (let i = 0; i < PVKeys.length; i++) {
    if (PVKeys[i] === body.pv) {
      PVIndex = i
      PVArray = attrObj.PVList[PVKeys[i]]
    }
  }
  // 5 search the PV array for object.keys[i] === body.av
  // 6 update its value to checked or unchecked
  for (let i = 0; i < PVArray.length; i++) {
    if (Object.keys(PVArray[i])[0] === body.av) {
      if (
        obj.tree[treeIndex][body.method][methodArrayIndex].PVList[
          PVKeys[PVIndex]
        ][i][body.av] === 'unchecked'
      ) {
        obj.tree[treeIndex][body.method][methodArrayIndex].PVList[
          PVKeys[PVIndex]
        ][i][body.av] = 'checked'
      } else {
        obj.tree[treeIndex][body.method][methodArrayIndex].PVList[
          PVKeys[PVIndex]
        ][i][body.av] = 'unchecked'
      }
    }
  }
  let newObj = JSON.stringify(obj)
  fs.writeFile(programPath, newObj, 'utf8', () => {
    res.send('File written')
  })
})

app.use(express.static('app'))

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
