export interface Suggestion {
  title: string;
  description: string;
  prompt: string;
}

export const suggestions: Suggestion[] = [
  {
    title: 'Implement Dark Mode',
    description: 'Add a toggle to switch between light and dark themes for better user comfort in different lighting conditions.',
    prompt: 'Please implement a dark mode for the application. Add a toggle button to switch between light and dark themes. The theme should be saved and persist across sessions.',
  },
  {
    title: 'Create a To-Do List',
    description: 'Build a simple to-do list application where users can add, view, and delete tasks. The tasks should be stored using the backend API.',
    prompt: 'Create a fully functional to-do list application. I need an input field and a button to add new tasks, a list to display the tasks, and a button next to each task to delete it. Please create the necessary backend API in `src/api/todos.ts` to handle creating, reading, and deleting tasks.',
  },
  {
    title: 'Add User Authentication',
    description: 'Integrate a basic user sign-up and login flow. This would be the first step towards a multi-user application.',
    prompt: 'Implement a basic user authentication system. Create a simple sign-up page and a login page. For now, just store user credentials in the in-memory database. No need for password hashing yet.',
  },
  {
    title: 'Refactor to a Card Layout',
    description: 'Organize the main content of the application into a more modern, card-based layout for better visual separation and structure.',
    prompt: 'Refactor the main view of the application to use a card-based layout. Each main item or piece of content should be enclosed in its own card with a slight shadow and rounded corners.',
  },
];
