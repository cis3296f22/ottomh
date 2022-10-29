# Frontend README

- [Frontend README](#frontend-readme)
  - [Connecting the different game pages together](#connecting-the-different-game-pages-together)
  - [Accessing the `lobbyId` and `username`](#accessing-the-lobbyid-and-username)
    - [Access the `lobbyId`: Method 1: Using the `useParams()` hook from `react-router` and the url](#access-the-lobbyid-method-1-using-the-useparams-hook-from-react-router-and-the-url)
    - [Access the `lobbyId` AND `username`: Method 2: Using the `useStore()` hook from `src/store.js`](#access-the-lobbyid-and-username-method-2-using-the-usestore-hook-from-srcstorejs)
      - [Usage: Different ways to access each variable in the store](#usage-different-ways-to-access-each-variable-in-the-store)
      - [Usage: Using the setter functions](#usage-using-the-setter-functions)
      - [Usage: Getting everything from the `store.js`](#usage-getting-everything-from-the-storejs)
    - [Debugging `store.js` state variables](#debugging-storejs-state-variables)
  - [How to export and import different components](#how-to-export-and-import-different-components)
  - [Simple file structure](#simple-file-structure)

## Connecting the different game pages together
We will use the `LobbyPage.js` file in `src/components/LobbyPage` to switch between the different stages of the game. This will keep our app in the same page without creating new pages and url links.

Once we're done creating the individual components for each stage of the game, we will import it into `LobbyPage.js` and add it to it's respective stage as shown below.

**A function prop MUST be passed to the component!!** This function will call `setStage()` and GO TO the NEXT stage. For example: 
- If we're in the waiting room, when we click the start button, it will GO TO the PLAYGAME stage. We pass the `onStartClick` function prop that will be called when the start button is clicked so that we can actually switch pages.
- If we're in the game stage, when the timer runs out, we will call the `onTimeover` function prop

![Screenshot 2022-10-28 182158](https://user-images.githubusercontent.com/44854928/198748494-f4cde210-7978-4a62-95ca-ecd1e3c6d7c1.png)

## Accessing the `lobbyId` and `username`

### Access the `lobbyId`: Method 1: Using the `useParams()` hook from `react-router` and the url
I THINK (not sure) that this is the most reliable way to get the `lobbyId` because using the `store.js` in method 2 can be a little finnicky depending on the situation. Like, if you `setLobbyId` and then immediately try to access the `lobbyId` from the `store`, it's not going to work right away.

IF your component is going to be displayed under the LobbyPage url `/lobbies/<id>`, `react-router` has a function that will allow you to access the id.

```javascript
/* MyComponent.js */

import { useParams } from 'react-router`;

export const MyComponent = () => {
 // variable name MUST be in curly braces AND named 'lobbyId'
 // because you're GETTING the variable named lobbyId that was "declared" in App.js as a route path
 const { lobbyId } = useParams(); 	
 return(<p>Lobby id: {lobbyId}</p>);
};
```

### Access the `lobbyId` AND `username`: Method 2: Using the `useStore()` hook from `src/store.js`

`store.js` is a global state management system that's being taken care of by [Zustand](https://zustand-demo.pmnd.rs/) (the lightweight equivalent to Redux for "smaller" apps). Plus, their mascot is a cute bear, and they're very commited to the bear theme. [Zustand documentation here](https://github.com/pmndrs/zustand).

We only need to create a javascript object with all the states that we want to manage.

Here's a list of all the variables that you can use from the store below. You can see the full code under `src/store.js`:
```javascript
/* src/store.js */

{
 lobbyId: "",   // usage: const lobbyId = useStore((state) => state.lobbyId);
 username: "",  // usage: const username = useStore((state) => state.username);
 setLobbyId: (id) => {},  // usage: setLobbyId(id);
 setUsername: (name) => {},   // usage: setLobbyId(id);
 clear: () => {lobbyId: "", username ""},  // usage: clear();
}
```

**WARNING!!!** The store may change each week as we add more featuers to the app. So, check the `src/store.js` file for the most up-to-date list of states and functions. This readme is just to show you how to use the `store` itself.

#### Usage: Different ways to access each variable in the store
```javascript
import { useStore } from '../../store.js' // if you're in a subfolder under components

export const MyComponent = () => {
 // access each variable one at a time
 const lobbyId = useStore((state) => state.lobbyId);
 const username = useStore((state) => state.username);
 
 // access variables as an array
 const [lobbyId, username] = useStore((state) => [state.lobbyId, state.username]);
 
 return(
  <p>
   Lobby id: {lobbyId}
   <br/>Username: {username}
  </p>
 );
};
```

#### Usage: Using the setter functions
```javascript
import { useStore } from '../../store.js'  // if you're in a subfolder under components

import { Button } from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap/Form';
import { useRef } from 'react';

export const MyComponent = () => {
 const [username, setUsername] = useStore((state) => [state.username, state.setUsername]);
 
 // returns the HTML DOM element for the input box without doing document.getElementById()
 // to actually get the node returned by the getElementById, you have to use `inputRef.current`
 const inputRef = useRef(); 
 
 return(
  <>
   <Form.Control placeholder="Enter new username" ref={inputRef}  />
   <Button type="button" onClick={() => setUsername(inputRef.current.value)}>Change username</Button>
   <p>Username: {username}</p>
  </>
 );
};
```

#### Usage: Getting everything from the `store.js`

It's apparently bad practice to grab everything from the store UNLESS you're actually going to USE everything. Because if you grab everything, and NOT use all of them, then it will still update all the states and their dependent components. And it could end up reloading the entire page as a worst case scenario, which would slow down the website. But I don't think we'll have any issues with that even if we did get everything.

```javascript
import { useStore } from '../../store'

export const MyComponent = () => {
    const {lobbyId, username, setLobbyId, setUsername, clear } = userStore();
};
```

### Debugging `store.js` state variables

1. Install the chrome extension [React Devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
2. In the Developer Tools, click the `>>` arrow and choose `Redux`

You will see all the states in the `store.js` and how they change.

![Screenshot 2022-10-28 201525](https://user-images.githubusercontent.com/44854928/198752918-ab6411ec-aa23-44f7-9a64-26cd524a14b3.png)


## How to export and import different components
1. export your component as a named export using `export const` instead of the `export default`
```javascript
/* MyComponent.js */

export const MyComponent = () => {
 return(<p>Hello world!</p>);
};

// ALL `export const` must be imported with curly braces!!
// ALL `export default` must be imported WITHOUT curly braces!!
```

2. export your component AGAIN so that it's easier to reuse in other components. Go to `src/components/index.js` and export your component
```javascript
/* src/components/index.js */

export * from './App/App.js';
export * from './IndexPage/IndexPage.js'
export * from './Join/Join.js';
export * from './LobbyPage/LobbyPage.js';
export * from './WaitState/WaitState.js';
export * from './MyComponent/MyComponent.js'; // <---------

// We export it again so that all references to the components will directed to the 'components' folder
```

3. To use a component, import the component with curly braces `{}` from 'wherever the components folder is located to your file'
```javascript
/* If your files is located at the root of the components folder: 
 * src/components/SomeComponent.js */
import { MyComponent } from '.'

/* If your file is located as a folder in the components folder: 
 * src/components/SomeComponent/SomeComponent.js */
import { MyComponent } from '../'

/* If your file is located at the root of src: 
 * src/index.js */
import { MyComponent } from './components'


// EVERYTHING IS RELATIVE TO THE COMPONENTS FOLDER!! 
// This is why we export components from the components/index.js file
```

## Simple file structure

All components will be in the `components` folder. Each component should have their own folders so we can keep all the related `.js` and `.css` files together.

![Screenshot 2022-10-28 191739](https://user-images.githubusercontent.com/44854928/198749476-1a03c36e-4104-4e07-b9f0-fedffb3ede52.png)
