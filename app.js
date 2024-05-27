// DOM ELEMENTS
const itemText = document.getElementById('itemtext');
const addButton = document.querySelector('.submit-btn');
const cancelButton = document.querySelector('.cancel-btn');
const deleteButton = document.querySelector('.delete-btn');
const undoButton = document.querySelector('.undo-btn');
const showFormButton = document.querySelector('.show-form');
const itemContainer = document.getElementById('item-container');
const messageContainer = document.querySelector('.message-container');
const deleteContainer = document.querySelector('.delete-container');
const formOverlay = document.getElementById('formOverlay');

//data
const listToRemove = [];
const itemList = [];
let selectedItemList = [];
let undoChangesList = [];


// initial buttons state
deleteButton.disabled = true;
undoButton.disabled = true;

function getLSData() {
  return JSON.parse(localStorage.getItem('items'));
}

function setLSData(items) {
  localStorage.setItem('items', JSON.stringify(items));
}

function isValidString(item) {
  const regex = /[^A-Za-z0-9\s\-']+$/;
  if (item.match(regex) !== null
    || item.trim('').length <= 0)
    return false;
  return true;
}

showData(getLSData(), false);

if (getLSData() === null) {
  deleteButton.disabled = true;
  itemContainer.innerHTML = 'No hay datos para mostrar';
} else {
  getDataItems();
}

// show form
showFormButton.addEventListener('click', (e) => {
  formOverlay.style.display = 'flex';
  itemText.focus();
})

addButton.addEventListener('click', function (e) {
  e.preventDefault();
  if (isValidString(itemText.value)) {
    const datosItem = {
      title: itemText.value,
      id: Date.now()
    };
    let registros = [];
    showData(getLSData(), true, registros, datosItem);
    // limpiar el formulario
    itemText.value = '';
    formOverlay.style.display = 'none';
    // validar que exista info para seleccionar
    if (getLSData()) {
      getDataItems();
      handleDeleteItems()
    }
  }
  else {
    console.log('Datos vacíos o caracteres especiales');
    messageContainer.classList.add('alert', 'alert-danger');
    messageContainer.innerText = 'No se pueden almacenar los datos si el campo está vacío';
    setTimeout(function () {
      messageContainer.classList.remove('alert', 'alert-danger');
      messageContainer.innerText = '';
    }, 3000);
  }
});

cancelButton.addEventListener('click', function(e) {
  e.preventDefault();
  if (itemText.value.trim('').length > 0) {
    itemText.value = '';
  }
  formOverlay.style.display = 'none';
})

// Evento para el botón de borrar
deleteButton.addEventListener('click', function (e) {
  e.preventDefault();
  if (selectedItemList.length > 0) {
    // console.log('empecemos a borrar');
    handleDeleteItems();
    if (getLSData().length == 0) {
      localStorage.removeItem('items');
      deleteButton.disabled = true;
      itemContainer.innerHTML = 'No hay datos para mostrar';
    }
  }
});

undoButton.addEventListener('click', handleUndoChanges)

function showData(almacenados, isNew, registros, datosItem) {
  if (almacenados !== null) {
    if (isNew) {
      registros = almacenados.concat([datosItem]);
      showHTML(almacenados, isNew, datosItem);
      setLSData(registros);
    }
    else {
      showHTML(almacenados, isNew);
    }
  }
  else {
    if (isNew) {
      cleanItemsContainer();
      registros.push(datosItem);
      showHTML([], isNew, datosItem);
      setLSData(registros);
    }
  }
}

// function showHTML
function showHTML(almacenados, isNew, datosItem) {
  if (isNew) {
    let lista = document.createElement('li');
    lista.id = datosItem.id;
    lista.innerText = datosItem.title + " "
    itemContainer.appendChild(lista);
  }
  else {
    almacenados.map(function (item) {
      let lista = document.createElement('li');
      lista.id = item.id;
      lista.innerText = item.title + " ";
      itemContainer.appendChild(lista);
    });
  }
}

function handleSelectItem(e) {
  // checar que solo se active cuando sea elemento párrafo
  if (e.target.nodeName === "LI") {
    e.target.classList.add('seleccionado')
    e.target.style.color = 'white';
    deleteButton.disabled = false;

    selectedItemList.push(e.target);
    if (undoChangesList.length > 0) {
      undoChangesList = [];
    }
  }
}

function handleDeleteItems() {
  let updatedData;
  selectedItemList.forEach((item) => {
    itemContainer.removeChild(item)
    updatedData = getLSData().filter((element) => {
      return element.id !== Number(item.id)
    })
    
    setLSData(updatedData);
    const datosItem = {
      title: item.innerText.trim(''),
      id: Number(item.id)
    };
    undoChangesList.push(datosItem);
  })
  
  selectedItemList = [];
  deleteButton.disabled = true;
  if (undoChangesList.length > 0) {
    undoButton.disabled = false;
  }
}

function handleUndoChanges(e) {
  e.preventDefault();
    cleanItemsContainer();
    let undoArray = []
     if (getLSData() === null) {
       undoChangesList.forEach((item) => {
         undoArray.push(item);
         showHTML([], true, item)
       })
       setLSData(undoArray)
     } else {
      let currentLSData = getLSData();
      undoChangesList.forEach((item) => {
        currentLSData.push(item);
      });
       setLSData(currentLSData);
       showHTML(currentLSData, false, []);
     }
    undoChangesList = [];
    undoButton.disabled = true;
    // validar que exista info
    if (getLSData()) {
      getDataItems()
      handleDeleteItems()
    }
}

function getDataItems() {
  allListItems = document.querySelectorAll('li');
  allListItems.forEach((item) => {
    item.addEventListener('click', handleSelectItem)
  })
}

function cleanItemsContainer() {
  itemContainer.innerHTML = '';
}
