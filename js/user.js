"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  hidePageComponents();
  $allStoriesList.show();
  if(currentUser.favorites.length > 0 || currentUser.ownStories.length > 0) putStoriesOnPage();
  updateNavOnLogin();
}

// story buttons click handle
$allStoriesList[0].addEventListener("click", async function(evt) {
  console.log("star button raw list clicked");
  if(!currentUser) return;
  switch(evt.target.id) {
    case 'favourite':
      onFavouriteBtnClicked(evt.target);
      break;
    case 'remove-btn':
      removeStoryBtnClicked(evt.target);
      break;
    case 'editStory-btn':
      showEditStoryUI(evt.target);
  }
});

/** favourite button is clicked */
async function onFavouriteBtnClicked(favouriteBtn) {
  let newUser = null;
  if (favouriteBtn.classList.contains("favourite-star")) {
    // remove favourite
    newUser = await storyList.removeFavourite(currentUser, favouriteBtn.parentElement.id)
  } else {
    // add favourite
    newUser = await storyList.addFavourite(currentUser, favouriteBtn.parentElement.id)
  }
  if(newUser){
    currentUser.favorites = newUser.favorites;
    putStoriesOnPage();
  }
    
}

async function removeStoryBtnClicked(removeBtn) {
  const story = await storyList.removeStory(currentUser, removeBtn.parentElement.id);
  if(story instanceof Story){
    storyList.stories = storyList.stories.filter(ele => ele.storyId !== story.storyId);
    //storyList = storyListTemp;
    putStoriesOnPage();
  }
}

function showEditStoryUI(editBtn) {
  $editStoryForm[0].dataset.storyId = editBtn.parentElement.id;
  hidePageComponents();
  $editStoryForm.show();
}

async function editStoryButtonClicked(storyId, title, author, url) {
  const storyIndex = getStoryIndex(storyId);
  if(!storyIndex) return;
  const newStory = await storyList.updateStory(currentUser, storyId, {title, author, url});
  if(newStory) {
    storyList.stories[storyIndex] = newStory;
    putStoriesOnPage();
  }
}

function getStoryIndex(storyId) {
  for(let i=0; i<storyList.stories.length; i++) {
    if(storyList.stories[i].storyId === storyId) {
      return i;
    }
  }
  return null;
}

$editStoryForm.on("submit", function(evt) {
  const title = $("#edit-title").val();
  const author = $("#edit-author").val();
  const url = $("#edit-url").val();
  editStoryButtonClicked(evt.target.dataset.storyId, title, author, url);
})