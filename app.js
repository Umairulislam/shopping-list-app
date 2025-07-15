// ========== DOM Elements ==========
const html = document.documentElement
const toggleBtn = document.querySelector(".theme-toggle")
const itemForm = document.querySelector(".item-form")
const itemInput = document.querySelector(".item-input")
const itemList = document.querySelector(".item-list")
const errorMsg = document.querySelector(".error-message")
const clearBtn = document.querySelector(".clear-btn")
const filterInput = document.querySelector(".filter-input")
const addBtn = document.querySelector(".add-btn")
let itemBeingEdited = null

// ========== Initialize App ==========
loadTheme()
initApp()
resetUi()

// ========== Theme Handling ==========
function handleChangeTheme() {
  const currentTheme = html.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  html.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    html.setAttribute("data-theme", savedTheme)
  }
}

// ========== Form Handling ==========
function handleAddItem(e) {
  e.preventDefault()
  const newItem = itemInput.value.trim()
  if (!validateItem(newItem, errorMsg)) return

  if (!itemBeingEdited && isDuplicateItem(newItem)) {
    errorMsg.textContent = "Item already exists."
    return
  }

  if (itemBeingEdited) {
    updateEditedItem(newItem)
  } else {
    addNewItem(newItem)
  }

  resetForm()
}

function validateItem(item, errorMsg) {
  if (item.length < 3) {
    errorMsg.textContent = "Item must be atleast three characters long."
    return false
  }
  if (item.length > 20) {
    errorMsg.textContent = "Item must be less than 20 characters."
    return false
  }
  return true
}

function resetForm() {
  itemInput.value = ""
  itemBeingEdited = null
  errorMsg.textContent = ""
  addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Item`
}

function addNewItem(text) {
  const li = createListItem(text)
  itemList.appendChild(li)
  saveItemToStorage(text)
  resetUi()
}

function updateEditedItem(newText) {
  const items = itemList.querySelectorAll(".item")
  items.forEach((li) => {
    const span = li.querySelector(".item-text")
    if (span.textContent === itemBeingEdited) {
      li.remove()
    }
  })
  removeItemFromStorage(itemBeingEdited)
  addNewItem(newText)
  itemBeingEdited = null
}

// ========== UI Utilities ==========
function createListItem(text) {
  const li = document.createElement("li")
  li.className = "item"

  const span = document.createElement("span")
  span.className = "item-text"
  span.textContent = text

  const actions = createItemActions()
  li.appendChild(span)
  li.appendChild(actions)
  return li
}

function createItemActions() {
  const div = document.createElement("div")
  div.className = "item-actions"

  const deleteBtn = createIconButton("delete-btn", "Delete", "fa-trash")
  const editBtn = createIconButton("edit-btn", "Edit", "fa-pen-to-square")

  div.appendChild(deleteBtn)
  div.appendChild(editBtn)
  return div
}

function createIconButton(className, title, iconClass) {
  const btn = document.createElement("button")
  btn.classList = className
  btn.title = title

  const icon = document.createElement("i")
  icon.classList.add("fa-solid", iconClass)

  btn.appendChild(icon)
  return btn
}

// Reset UI state
function resetUi() {
  const items = itemList.querySelectorAll(".item")

  if (items.length === 0) {
    filterInput.style.display = "none"
    clearBtn.style.display = "none"
  } else {
    filterInput.style.display = "block"
    clearBtn.style.display = "block"
  }
}

// ========== Item List Handling ==========
function handleItemClick(e) {
  if (e.target.closest(".delete-btn")) {
    handleRemoveItem(e)
  } else if (e.target.closest(".edit-btn")) {
    handleEditItem(e)
  }
}

function handleRemoveItem(e) {
  if (!confirm("Are you sure you want to delete this item?")) return

  const li = e.target.closest("li")
  const text = li.querySelector(".item-text").textContent
  li.remove()
  removeItemFromStorage(text)
  resetUi()
}

function handleEditItem(e) {
  const li = e.target.closest("li")
  const text = li.querySelector(".item-text").textContent

  itemInput.value = text
  itemInput.focus()
  itemBeingEdited = text
  addBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Update Item`
}

function handleClearAll() {
  if (!confirm("Are you sure you want to delete all items?")) return

  itemList.querySelectorAll(".item").forEach((item) => item.remove())
  clearItemsFromStorage()
  resetUi()
}

function handleFilterItems(e) {
  const searchText = e.target.value.toLowerCase()
  const items = itemList.querySelectorAll(".item")

  items.forEach((item) => {
    const itemText = item.querySelector(".item-text").textContent.toLocaleLowerCase()
    item.style.display = itemText.includes(searchText) ? "flex" : "none"
  })
}

// ========== Storage Utilities ==========
function getItemsFromStorage() {
  const items = localStorage.getItem("items")
  return items ? JSON.parse(items) : []
}

function saveItemToStorage(text) {
  const items = getItemsFromStorage()
  items.push(text)
  localStorage.setItem("items", JSON.stringify(items))
}

function removeItemFromStorage(text) {
  const updatedItems = getItemsFromStorage().filter((item) => item !== text)
  localStorage.setItem("items", JSON.stringify(updatedItems))
}

function clearItemsFromStorage() {
  localStorage.removeItem("items")
}

function isDuplicateItem(text) {
  const items = getItemsFromStorage()
  return items.some((item) => item.toLowerCase() === text.toLowerCase())
}

function initApp() {
  const items = getItemsFromStorage()
  items.forEach((item) => {
    const li = createListItem(item)
    itemList.appendChild(li)
  })
}

// ========== Event Listeners ==========
toggleBtn.addEventListener("click", handleChangeTheme)
itemForm.addEventListener("submit", handleAddItem)
itemList.addEventListener("click", handleItemClick)
clearBtn.addEventListener("click", handleClearAll)
filterInput.addEventListener("input", handleFilterItems)
