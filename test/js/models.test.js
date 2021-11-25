let user={};

beforeAll(function() {
    user = {
        "username": "rijogeorge7",
        "name": "Rijo George",
        "createdAt": "2021-11-24T16:43:25.742Z",
        "favorites": [],
        "ownStories": [],
        "loginToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJpam9nZW9yZ2U3IiwiaWF0IjoxNjM3NzcyMjA1fQ.9U7SZRTa0YsmRv2P9FkvFAR5OMlMr9fqHu9Rce2eGI8"
    }
})

describe("add story to the database", function() {
    let story={};

it("add story and return added story object", async function() {
    const storyList = new StoryList();
    story = await storyList.addStory(user,
        {title: "Test", author: "Me", url: "http://meow.com"});
    expect(story).toBeInstanceOf(Story);
})

afterEach(async function() {
    const url = `https://hack-or-snooze-v3.herokuapp.com/stories/${story.storyId}`
    const res = await axios({
        url: url,
        method: "DELETE",
        data: {token: user.loginToken}
    });
})

});

describe("add favourite story to the database", function() {
    
const storyId = "10f28f72-db8d-4fae-bab4-6ca12ccfb7d5";
it("add favourite story and return updated user object", async function() {
    const storyList = new StoryList();
    newUser = await storyList.addFavourite(user, storyId);
    expect(newUser).toBeInstanceOf(User);
})

afterEach(async function() {
    const url = `https://hack-or-snooze-v3.herokuapp.com/users/${user.username}/favorites/${storyId}`
    const res = await axios({
        url: url,
        method: "DELETE",
        data: {token: user.loginToken}
    });
    console.log(res);
})

});