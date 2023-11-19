const books = [];
let filteredBooks = [];
const RENDER_EVENT = "render-todo";
const RENDER_EVENT_FILTER = "render-todo-filter";
const DELETE_ITEM_EVENT = "delete-item";
const STORAGE_KEY = "bookshelf-apps";

const addModal = document.querySelector(".input_modal_container");
const addButton = document.querySelector(".add_book_button");
const cancelButton = document.getElementById("cancelSubmit");

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Maaf, browser anda tidak mendukung web storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
    filteredBooks = books.slice();
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id == bookId) return book;
  }
  return null;
}
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id == bookId) return index;
  }

  return -1;
}
function saveData() {
  if (isStorageExist) {
    const parsedData = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsedData);
  }
}

function makeBook(bookObject) {
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book-container");
  bookContainer.setAttribute("id", `book-${bookObject.id}`);

  const textContainer = document.createElement("div");
  textContainer.classList.add("text-container");

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-book-container");
  imgContainer.innerHTML = '<img src="assets/book-item.jpeg"/>';

  const textTitle = document.createElement("h4");
  const textAuthorandYear = document.createElement("p");

  textTitle.innerText = bookObject.title;
  textAuthorandYear.innerHTML = `${bookObject.author} &middot; ${bookObject.year}`;

  textContainer.append(textTitle, textAuthorandYear);
  bookContainer.append(imgContainer, textContainer);

  if (bookObject.isComplete) {
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-redo");
    undoButton.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

    undoButton.addEventListener("click", () => {
      undoFromCompleted(bookObject.id);
    });

    deleteButton.addEventListener("click", () => {
      showDeleteModal(bookObject.id);
    });

    actionContainer.append(undoButton, deleteButton);
    bookContainer.append(actionContainer);
  } else {
    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    const redoButton = document.createElement("button");
    redoButton.classList.add("undo-redo");
    redoButton.innerHTML = '<i class="fa-solid fa-check"></i>';
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

    redoButton.addEventListener("click", () => {
      redoFromUncompleted(bookObject.id);
    });

    deleteButton.addEventListener("click", () => {
      showDeleteModal(bookObject.id);
    });
    actionContainer.append(redoButton, deleteButton);
    bookContainer.append(actionContainer);
  }

  return bookContainer;
}

function addBook() {
  const textTitle = document.getElementById("inputBookTitle").value;
  const textAuthor = document.getElementById("inputBookAuthor").value;
  const textYear = document.getElementById("inputBookYear").valueAsNumber;
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const bookID = generateId();
  const bookObject = generateBookObject(bookID, textTitle, textAuthor, textYear, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  console.log("add book");
  // Membersihkan nilai input setelah menambahkan buku
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;
}

function removeObjectItem(todoId) {
  const bookIndex = findBookIndex(todoId);

  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function redoFromUncompleted(todoId) {
  const bookObject = findBook(todoId);

  if (bookObject === null) return;

  bookObject.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoFromCompleted(todoId) {
  const bookObject = findBook(todoId);

  if (bookObject === null) return;

  bookObject.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function showDeleteModal(bookId) {
  const deleteBookModal = document.getElementById("deleteBookModal");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const closeButton = document.getElementById("close-modal");

  deleteBookModal.style.display = "block";

  function hideDeleteModal() {
    deleteBookModal.style.display = "none";
  }

  cancelDeleteBtn.addEventListener("click", hideDeleteModal);
  closeButton.addEventListener("click", hideDeleteModal);

  confirmDeleteBtn.addEventListener("click", () => {
    removeObjectItem(bookId);
    hideDeleteModal();
  });
}

function filterBook() {
  const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();

  filteredBooks = books.filter((book) => {
    return book.title.toLowerCase().includes(searchTitle);
  });

  document.dispatchEvent(new Event(RENDER_EVENT_FILTER));
}

document.addEventListener(RENDER_EVENT, () => {
  const completedList = document.getElementById("completeBookshelfList");
  const inCompletedList = document.getElementById("incompleteBookshelfList");

  //cleaning list item
  completedList.innerText = "";
  inCompletedList.innerText = "";

  for (const book of books) {
    const itemList = makeBook(book);

    if (book.isComplete) completedList.append(itemList);
    else inCompletedList.append(itemList);
  }

  refreshStats();
});
document.addEventListener(RENDER_EVENT_FILTER, () => {
  const completedList = document.getElementById("completeBookshelfList");
  const inCompletedList = document.getElementById("incompleteBookshelfList");

  //cleaning list item
  completedList.innerText = "";
  inCompletedList.innerText = "";

  for (const book of filteredBooks) {
    const itemList = makeBook(book);

    if (book.isComplete) completedList.append(itemList);
    else inCompletedList.append(itemList);
  }
});

function updateDateTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDateElement = document.getElementById("currentDate");
  const greetingMessageElement = document.getElementById("greetingMessage");

  // Menampilkan tanggal hari ini
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  currentDateElement.textContent = now.toLocaleDateString(undefined, options);

  // Menampilkan pesan salam
  let greetingMessage;
  if (currentHour >= 5 && currentHour < 12) {
    greetingMessage = "Good morning!";
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingMessage = "Good afternoon!";
  } else {
    greetingMessage = "Good evening!";
  }
  greetingMessageElement.textContent = greetingMessage;
}

function refreshStats() {
  const totalBookElement = document.getElementById("book-total");
  const totalCompletedElement = document.getElementById("completed-total");
  const totalIncompletedElement = document.getElementById("incompleted-total");

  const totalBooks = books.length;
  let totalCompletedBooks = 0;
  let totalIncompletedBooks = 0;
  books.forEach((book) => {
    if (book.isComplete) {
      totalCompletedBooks++;
    } else {
      totalIncompletedBooks++;
    }
  });

  totalBookElement.innerText = totalBooks;
  totalCompletedElement.innerText = totalCompletedBooks;
  totalIncompletedElement.innerText = totalIncompletedBooks;
}

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist) {
    loadDataFromStorage();
  }

  //greeting section
  updateDateTime();
  setInterval(updateDateTime, 60000);

  //bookself stats
  refreshStats();

  //Cari Buku
  const filterForm = document.getElementById("searchBook");
  filterForm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    filterBook();
  });

  //submit form add book
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    addModal.classList.remove("modal-open");
    addBook();
  });
});

addButton.addEventListener("click", () => {
  addModal.classList.toggle("modal-open");
  const textSpanButton = document.getElementById("span-select-status");
  const isComplete = document.getElementById("inputBookIsComplete");
  isComplete.addEventListener("change", () => {
    const status = isComplete.checked;
    if (status) textSpanButton.innerText = "Selesai dibaca";
    else textSpanButton.innerText = "Belum selesai dibaca";
  });
});
cancelButton.addEventListener("click", () => {
  addModal.classList.toggle("modal-open");
});
