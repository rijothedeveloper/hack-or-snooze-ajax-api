"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <small class="grey-star" id="favourite">&bigstar;</small>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <button class="hidden" id="remove-btn">Delete</button>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    if(currentUser && isFavourite(currentUser.favorites, story)) {
      $story.children()[0].classList.add("favourite-star");
    }
    if(currentUser && isOwnStory(currentUser.ownStories, story) ) {
      $story.children()[4].classList.remove("hidden");
    }
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function isFavourite(favourites, story) {
  if(favourites.length < 1) return false;
  for(let favourite of favourites) {
    if(favourite.storyId === story.storyId) return true
  }
  return false;
}

function isOwnStory(myStories, story) {
  if(myStories.length < 1) return false;
  for(let myStory of myStories) {
    if(myStory.storyId === story.storyId) return true;
  }
  return false;
}

$newStoryForm.on("submit", function() {
  const title = $("#title").val();
  const author = $("#author").val();
  const url = $("#url").val();
  createNewStory(title, author, url);
})
/** handle new story form submission  */

async function createNewStory(title, author, url) {
  if(!storyList) return;
  const story = await storyList.addStory(currentUser, {title, author, url});
  if(story) {
    storyList.stories.push(story);
    currentUser.ownStories.push(story);
    updateUIOnNewStory();
  }
}

/** update UI after new story submission */

function updateUIOnNewStory() {
  $newStoryForm.hide();
  putStoriesOnPage();
}