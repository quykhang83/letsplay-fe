const tabs = document.querySelectorAll('.btn-outline-secondary');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // remove active class from all tabs and panels
    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    
    // add active class to the clicked tab and panel
    const target = tab.dataset.tab;
    const panel = document.querySelector(`.tab-panel[data-tab="${target}"]`);
    tab.classList.add('active');
    panel.classList.add('active');
  });
});
