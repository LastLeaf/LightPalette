// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

window.MathJax = {
	extensions: ['tex2jax.js'],
	jax: ['input/TeX', 'output/HTML-CSS'],
	messageStyle: "none",
	showMathMenu: false,
	showMathMenuMSIE: false,
	elements: ['wrapper'],
	tex2jax: {
		ignoreClass: 'mathjax_ignore',
		processClass: 'mathjax'
	},
	'HTML-CSS': { availableFonts: ['TeX'] },
	imageFont: null
};
