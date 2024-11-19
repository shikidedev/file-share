<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
  
    export let options = []; // Array of options
    export let placeholder = "Select an option"; // Placeholder text
    export let selected = null; // Selected option is now exported and bindable
    export let 
    const isOpen = writable(false); // Controls dropdown visibility
  
    // Handle option selection
    const selectOption = (option) => {
      selected = option;
      isOpen.set(false);
    };
  
    // Close dropdown when clicking outside
    let dropdown;
    onMount(() => {
      const handleClickOutside = (event) => {
        if (!dropdown.contains(event.target)) {
          isOpen.set(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    });
  </script>
  
  <style>
    .custom-select {
      position: relative;
      display: inline-block;
      width: 200px;
      font-family: Arial, sans-serif;
    }
  
    .custom-select-trigger {
      padding: 10px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .custom-select-options {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: white;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      max-height: 150px;
      overflow-y: auto;
      z-index: 100;
    }
  
    .custom-select-option {
      padding: 10px;
      cursor: pointer;
    }
  
    .custom-select-option:hover {
      background: #f0f0f0;
    }
  </style>
  
  <div class="custom-select" bind:this={dropdown}>
    <!-- Trigger -->
    <div class="custom-select-trigger" on:click={() => isOpen.update((state) => !state)}>
      <span>{selected ? selected.label : placeholder}</span>
      <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L5 5 L10 0" stroke="black" fill="none" />
      </svg>
    </div>
  
    <!-- Dropdown Options -->
    {#if $isOpen}
      <div class="custom-select-options">
        {#each options as option}
          <div
            class="custom-select-option"
            on:click={() => selectOption(option)}
          >
            {option.label}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  