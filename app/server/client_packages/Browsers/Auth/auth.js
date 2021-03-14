let disabled = false;
let currentPage = "loading";
let currentPageEl = $(".page__loading");
const lockEl = $(".lock")
const pagesEl = $(".main__pages")

$(document).ready(() => {
    start();
});

function start() {
    currentPageEl.addClass("page_active");
}

function redirectTo(page) {
    if (isLock()) return;
    lock(true);
    currentPageEl.addClass("page_predisable").removeClass("page_active");
    setTimeout(() => {
        currentPageEl.removeClass("page_predisable");
        currentPage = page;
        currentPageEl = $(".page__" + page);
        currentPageEl.addClass("page_preactive");
        setTimeout(() => {
            currentPageEl.addClass("page_active").removeClass("page_preactive");
            lock(false);
        }, 250);
    }, 250);
}

function lock(state) {
    if (state) {
        pagesEl.removeClass("main__page_active")
        lockEl.addClass("lock_active")
    } else {
        pagesEl.addClass("main__page_active")
        lockEl.removeClass("lock_active")
    }
    disabled = state;
}
function isLock() {
    return disabled;
}

$(document).keyup((e) => {
    if (isLock()) return;
    if (e.keyCode === 13) {
        $("input").blur();
        switch (currentPage) {
            case "login":
                login.confirm();
                break;
            case "register":
                register.confirm();
                break;
            case "forgot-password":
                forgotPassword.confirm();
                break;
            case "create-character":
                createCharacter.confirm();
                break;
            default:
                return;
        }
    }
});

/** Login Page */
const login = {
    fields: {
        login: $("input[name='login__login']"),
        password: $("input[name='login__password']"),
        forgotPassword: $("input[name='login__forgot-password']")
    },
    confirm: () => {
        if (isLock()) {
            return
        }
        mp.trigger('CEF_Auth-SendLoginCredentials', JSON.stringify({
            login: login.fields.login.val(),
            password: login.fields.password.val()
        }))
        login.clearPassword();
        lock(true)
    },
    setData: (username) => {
        login.fields.login.val(username)
    }, // При успешной регистрации закинуть логин
    clearPassword: () => {
        login.fields.password.val("");
    }
};

/** Register Page */
const register = {
    fields: {
        username: $("input[name='register__username']"),
        email: $("input[name='register__email']"),
        password: $("input[name='register__password']"),
        repeatPassword: $("input[name='register__repeat-password']")
    },
    confirm: () => {
        mp.trigger('CEF_Auth-SendRegisterCredentials', JSON.stringify({
            username: register.fields.username.val(),
            email: register.fields.email.val(),
            password: register.fields.password.val(),
            repeatPassword: register.fields.repeatPassword.val()
        }))
        lock(true)
    },
    clearPassword: () => {
        register.fields.password.val("");
        register.fields.repeatPassword.val("");
    },
    usernameBusy: () => {
        register.fields.username.val("")
        register.fields.username.focus()
    },
    emailBusy: () => {
        register.fields.email.val("")
        register.fields.email.focus()
    },
    clearFields: () => {
        register.fields.nickname.val("");
        register.fields.email.val("");
        register.fields.password.val("");
        register.fields.repeatPassword.val("");
    }
};

/** Forgot password Page */
const forgotPage = {
    fields: {
        nickname: $("input[name='forgot-password__nickname']"),
        email: $("input[name='forgot-password__email']")
    },
    confirm: () => {
        console.log("Forgot password confirmed");
    },
    resetFields: () => {
        forgotPage.fields.nickname.val("");
        forgotPage.fields.email.val("");
    }
};

/** Create character Page */
const createCharacter = {
    confirm: () => {
        console.log("Create character confirmed");
    }
};


/** Select character Page */
const selectCharacter = {
    elements: {
        title: $("#select-character__title"),
        viewport: $(".page__select-character")
    },
    generateCharacterCards: (characters) => {
        characters = JSON.parse(characters)
        if (characters) {
            selectCharacter.elements.title.text("Выберите персонажа")
            for (const character of characters) {
                selectCharacter.elements.viewport.append(`<div class="card" onclick="selectCharacter.confirm(${character.id})">
        <img src="https://i.ibb.co/4m9dZvp/Screenshot-248.png" alt="" class="card__image">
        <span class="card__title">${character.first_name} ${character.last_name}</span>
        <span class="card__item">21 год</span>
      </div>`)
            }
        } else {
            selectCharacter.elements.title.text("У вас нет персонажей")
        }
        selectCharacter.elements.viewport.append(`<div class="card card_create-character" onclick="redirectTo('create-character')">
        <span class="material-icons card__title-icon">person_add</span>
        <span class="card__title">Создать персонажа</span>
      </div>`)
    },
    confirm: (id) => {
        mp.trigger('CEF_Auth-SendSelectedCharacter', id)
        lock(true)
    }
}
