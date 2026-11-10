if (/^\/(en\/?)?$/.test(location.pathname)) {
  document.documentElement.style.background = "#07050a";
  document.documentElement.classList.add("odd", "oz-in-hero");
}
if (/^\/en(\/|$)/.test(location.pathname)) document.documentElement.lang = "en";
