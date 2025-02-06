// state.js
export const state = {
    data: {
      language: {
        loading: "Loading...",
        error: {
          title: "Failed to load!",
          message: "An unexpected error occurred. Please try again later.",
          back: "BACK TO LOGIN"
        },
        login: {
          title: "Login",
          email: "Email address",
          password: "Password",
          submit: "Sign in",
          registerPrompt: "Not a member?",
          registerLink: "Register"
        },
        twoFactor: {
          title: "2FA",
          code: "2FA Code",
          verify: "Verify"
        },
        register: {
          title: "Register",
          username: "Username",
          email: "Email address",
          password: "Password",
          submit: "Register",
          loginPrompt: "Already have an account?",
          loginLink: "Login"
        }
      }
    }
  };
  
  // languages.js
  import { state } from "./state";
  
  export function updateLanguage() {
    const lang = state.data.language;
    
    // Loading view
    document.getElementById('view-loading').textContent = lang.loading;
  
    // Error view
    const errorView = document.getElementById('view-failure');
    errorView.innerHTML = `
      <p>${lang.error.title}</p>
      <p>${lang.error.message}</p>
      <a id="errorLogin" href="#">${lang.error.back}</a>
    `;
  
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.innerHTML = `
      <h2>${lang.login.title}</h2>
      <div class="form-outline mb-4">
        <label class="form-label" for="loginEmail">${lang.login.email}</label>
        <input type="email" id="loginEmail" class="form-control" required />
      </div>
      <div class="form-outline mb-4">
        <label class="form-label" for="loginPassword">${lang.login.password}</label>
        <input type="password" id="loginPassword" class="form-control" required />
      </div>
      <button type="button" id="loginButton" class="btn btn-primary btn-block mb-4">${lang.login.submit}</button>
      <p>${lang.login.registerPrompt} <a href="#" id="registerLink">${lang.login.registerLink}</a></p>
    `;
  
    // 2FA form
    const twoFactorForm = document.getElementById('2fa');
    twoFactorForm.innerHTML = `
      <h2>${lang.twoFactor.title}</h2>
      <div class="form-outline mb-4">
        <label class="form-label" for="2faCode">${lang.twoFactor.code}</label>
        <input type="text" id="2faCode" class="form-control" required />
      </div>
      <button class="btn btn-primary btn-block mb-4" type="submit">${lang.twoFactor.verify}</button>
    `;
  
    // Register form
    const registerForm = document.getElementById('registerForm');
    registerForm.innerHTML = `
      <h2>${lang.register.title}</h2>
      <div class="form-outline mb-4">
        <label class="form-label" for="registerUsername">${lang.register.username}</label>
        <input type="text" id="registerUsername" class="form-control" />
      </div>
      <div class="form-outline mb-4">
        <label class="form-label" for="registerEmail">${lang.register.email}</label>
        <input type="email" id="registerEmail" class="form-control" />
      </div>
      <div class="form-outline mb-4">
        <label class="form-label" for="registerPassword">${lang.register.password}</label>
        <input type="password" id="registerPassword" class="form-control" />
      </div>
      <button type="button" id="registerButton" class="btn btn-primary btn-block mb-4">${lang.register.submit}</button>
      <p>${lang.register.loginPrompt} <a href="#" id="loginLink">${lang.register.loginLink}</a></p>
    `;
  }