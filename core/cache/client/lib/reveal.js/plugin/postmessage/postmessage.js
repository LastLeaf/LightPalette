/*

	simple postmessage plugin

	Useful when a reveal slideshow is inside an iframe.
	It allows to call reveal methods from outside.

	Example:
		 var reveal =  window.frames[0];

		 // Reveal.prev();
		 reveal.postMessage(JSON.stringify({method: 'prev', args: []}), '*');
		 // Reveal.next();
		 reveal.postMessage(JSON.stringify({method: 'next', args: []}), '*');
		 // Reveal.slide(2, 2);
		 reveal.postMessage(JSON.stringify({method: 'slide', args: [2,2]}), '*');

	Add to the slideshow:

		dependencies: [
			...
			{ src: 'plugin/postmessage/postmessage.js', async: true, condition: function() { return !!document.body.classList; } }
		]

*/
!function(){window.addEventListener("message",function(e){{var a=JSON.parse(e.data),n=a.method;a.args}"function"==typeof Reveal[n]&&Reveal[n].apply(Reveal,a.args)},!1)}();
