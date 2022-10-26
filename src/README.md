# Front-End React File Structure

## `src` folder
In the `src` folder, there should be 2 folders:

* the `images` folder contains images and other static  no folders inside of it
* the `components` folder contains all the React components

We will keep the `index.js` and it's associated css file `index.css` together in the `src` folder.

```
src
├── components/
├── images/
├── indexStyles.css
├── index.js
├── reportWebVitals.js
└── setupTests.js
```

## `components` folder
```
src/components
├── App
│   ├── appStyles.css
│   ├── App.js
│   └── App.test.js
├── Home
│   ├── homeStyles.css
│   └── Home.js
├── Join
│   ├── joinStyles.css
│   └── Join.js
└── index.js
```

Each component should have their own folder. For example, the component named `Home` should have it's own folder with the same name `Home`. 

It's associated css file should be included in the folder as well.

The `components` folder will have **ONE** file called `index.js`. This will export all the components inside each of the folders so that we can easily reuse them outside the components folder.

### Naming convention for components and their files
We will follow Professor Sally K's naming conventions from the Web App course:

* Component function names should use PascalCase (e.g. HomePage) to distinguish between a component function and a regular function
  * `export const HomePage = () => {}`
* Other functions within the component should continue to use camelCase (e.g. homePage)
  * `function handleSubmitButton() {}`
* `.js` files names should be capitalized and have the same name as the component
* `.css` files names should use camelCase, be the name of the component + "Styles"
  * `homePageStyles.css`

### Naming convention INSIDE OF css files
We'll follow the default React naming convention:

Inside a `.css` file, every class should start with `.componentname-`

Example:

```
in homePageStyles.css

.homepage-logo {}

.homepage h1 {}
```