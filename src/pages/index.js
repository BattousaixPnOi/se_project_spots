import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  toggleButtonState,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

let currentUserId;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "17c21ebe-7365-4993-90ac-bc77591c8271",
    "Content-Type": "application/json",
  },
});

const profileEditButton = document.querySelector(".profile__edit-button");
const cardModalBtn = document.querySelector(".profile__add-button");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const cardsList = document.querySelector(".cards__list");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

api
  .getAppInfo()
  .then(([userInfo, cards]) => {
    currentUserId = userInfo._id;
    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;

    if (Array.isArray(cards)) {
      cards.forEach((item) => {
        const cardEl = getCardElement(item);
        cardsList.append(cardEl);
      });
    } else {
      console.error("Expected cards to be an array, got:", cards);
    }
  })
  .catch(console.error);

// Edit Modal Elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editInputElement = editModal.querySelector("#profile-description-input");
const editModalCloseBtn = editModal.querySelector(".modal__close-button");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Card Modal Elements
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-button");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-button");

// Avatar Modal Elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-button");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-button");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

//Delete Modal Elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(
  ".modal__submit-button-cancel"
);

// Preview Modal Elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = document.querySelector(".modal__image");
const previewModalCaptionEl = document.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(
  "#modal__preview-close-button"
);

// Card Element
const cardTemplate = document.querySelector("#card-template");

let selectCard, selectedCardId;

const modals = document.querySelectorAll(".modal");

function handleLike(evt, id) {
  const likeButton = evt.target;
  const isLiked = likeButton.classList.contains("card__like-button_liked");

  api
    .changeLikeStatus({ id, isLiked })
    .then(() => {
      likeButton.classList.toggle("card__like-button_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-button");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.alt = data.name;
  });

  return cardElement;
}

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

modals.forEach((modal) => {
  modal.addEventListener("click", function (evt) {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscBtnClose);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  api
    .addNewCard({ name, link })
    .then((data) => {
      const cardEl = getCardElement(data);
      cardsList.prepend(cardEl);
      cardForm.reset();
      resetValidation(cardForm, settings);
      closeModal(cardModal);
    })
    .catch(console.error);
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      document.querySelector(".profile__avatar").src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, cardId) {
  selectCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings);
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

function handleEscBtnClose(evt) {
  if (evt.key === "Escape") {
    const activeModal = document.querySelector(".modal_opened");
    if (activeModal) {
      closeModal(activeModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscBtnClose);
}

enableValidation(settings);
