fw._tmpls({i18n:{},presentation:function(e,n,t,s,d){this.compilerInfo=[4,">= 1.0.0"],t=this.merge(t,e.helpers),d=d||{};var l,i="",r="function";return i+='<!DOCTYPE html>\n<html>\n	<head>\n		<meta charset="UTF-8">\n		<link rel="stylesheet" href="/~/lib/reveal.js/css/reveal.min.css">\n		<link rel="stylesheet" href="/~/lib/reveal_theme.css" id="theme">\n		<link rel="stylesheet" href="/~/theme/drivers/presentation.css" id="theme">\n		<script src="/~/lib/reveal.js/lib/js/head.min.js"></script>\n		<script src="/~/lib/reveal.js/js/reveal.js"></script>\n	</head>\n	<body>\n',l=typeof n===r?n.apply(n):n,(l||0===l)&&(i+=l),i+="\n		<div class=\"slide-sync\">\n			<div id=\"slide_sender\" style=\"display:none\">\n				<input type=\"checkbox\" id=\"slide_sender_checkbox\"> <label for=\"slide_sender_checkbox\">将我的进度发送给所有在线读者。</label>\n			</div>\n			<div id=\"slide_reader\" style=\"display:none\">\n				<input type=\"checkbox\" id=\"slide_reader_checkbox\"> <label for=\"slide_reader_checkbox\">作者在线，同步他的进度。</label>\n			</div>\n		</div>\n<script type=\"text/javascript\">\n(function(){\n	if(typeof(Reveal) === 'undefined') {\n		setTimeout(arguments.callee, 200);\n		return;\n	}\n	// init reveal.js\n	Reveal.initialize({\n		controls: true,\n		progress: true,\n		slideNumber: true,\n		history: false,\n		center: true,\n		transition: 'default',\n		dependencies: [\n			{ src: '/~/lib/reveal.js/lib/js/classList.js', condition: function() { return !document.body.classList; } },\n			{ src: '/~/lib/reveal.js/plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } }\n		]\n	});\n	// add full screen button\n	var btn = document.createElement('div');\n	btn.className = 'full-screen-button';\n	btn.style.position = 'absolute';\n	btn.style.right = '57px';\n	btn.style.bottom = '57px';\n	btn.style.width = '16px';\n	btn.style.height = '16px';\n	document.body.appendChild(btn);\n	document.body.ondoubletap = document.body.ondblclick = btn.onclick = function(e){\n		if(e.target.parentElement.className === 'controls') return;\n		window.toggleFullScreen();\n	};\n	// sync current slide\n	document.getElementById('slide_sender_checkbox').onchange = function(){\n		var that = this;\n		that.disabled = true;\n		var status = Reveal.getIndices();\n		if(that.checked)\n			pg.rpc('/drivers/presentation:currentSlide.send', {id: postId, col: status.h, row: status.v}, function(){\n				that.checked = true;\n				that.disabled = false;\n			}, function(err){\n				that.checked = false;\n				that.disabled = false;\n			});\n		else\n			pg.rpc('/drivers/presentation:currentSlide.sendEnd', postId, function(){\n				that.checked = false;\n				that.disabled = false;\n			}, function(err){\n				that.checked = true;\n				that.disabled = false;\n			});\n	};\n	Reveal.addEventListener('slidechanged', function(e) {\n		if(!document.getElementById('slide_sender_checkbox').checked) return;\n		var status = Reveal.getIndices();\n		pg.rpc('/drivers/presentation:currentSlide.progress', {id: postId, col: status.h, row: status.v});\n	});\n	var prevStatus = null;\n	document.getElementById('slide_reader_checkbox').onchange = function(){\n		if(this.checked)\n			Reveal.slide(prevStatus.col, prevStatus.row);\n	};\n	var syncSlide = function(status){\n		prevStatus = status;\n		if(document.getElementById('slide_reader_checkbox').checked)\n			Reveal.slide(status.col, status.row);\n	};\n	var syncStatus = function(status){\n		if(status.type === 'sender') {\n			document.getElementById('slide_reader').style.display = 'none';\n			document.getElementById('slide_reader_checkbox').checked = false;\n			document.getElementById('slide_sender').style.display = 'block';\n		} else if(status.type === 'reader') {\n			document.getElementById('slide_reader').style.display = 'block';\n			document.getElementById('slide_sender').style.display = 'none';\n			document.getElementById('slide_sender_checkbox').checked = false;\n			syncSlide(status);\n		} else if(status.type === 'progress') {\n			syncSlide(status);\n		} else {\n			document.getElementById('slide_reader').style.display = 'none';\n			document.getElementById('slide_reader_checkbox').checked = false;\n			document.getElementById('slide_sender').style.display = 'none';\n			document.getElementById('slide_sender_checkbox').checked = false;\n		}\n	};\n	pg.msg('drivers.presentation.'+postId, syncStatus);\n	var listenCurrentSlide = function(){\n		pg.rpc('/drivers/presentation:currentSlide.listen', postId, syncStatus);\n	};\n	listenCurrentSlide();\n	pg.on('socketConnect', listenCurrentSlide);\n})();\n</script>\n	</body>\n</html>\n"}});