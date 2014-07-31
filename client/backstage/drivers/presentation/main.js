// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;
	var _ = tmpl.i18n;

	lp.registerDriver('presentation', {
		name: _('Presentation'),
		priority: 6000,
		editor: function(div, data, userInfo){

			var $div = $(div).html(tmpl.presentation({
				driver: data.driver,
				admin: userInfo.type === 'admin'
			}));

			// table builder
			var $table = $('.presentation .driver_slide_table');
			var $slide = $('.presentation .driver_slide');
			var tableDelRow = function(col, row){
				var $col = $table.children().eq(col);
				var $row = $col.children().eq(row);
				$($row[0].contentTextarea).remove();
				if($col.children().length <= 1)
					$col.remove();
				else
					$row.remove();
				if(!$table.children().length)
					tableAddCol();
				$table.children().each(function(k, v){
					$(v).children()
						.eq(0).text(k).end()
						.eq(1).text('').end();
				});
			};
			var tableAddRow = function(col, row, data){
				var $newRow = $('<div class="driver_slide_row"></div>');
				$newRow[0].contentTextarea = $(tmpl.presentation_content(typeof(data) === 'undefined' ? content[col][row] : data)).appendTo($slide);
				var $col = $table.children().eq(col);
				if(typeof(row) !== 'undefined' && row < $col.children().length)
					$newRow.insertBefore($col.children().eq(row));
				else
					$newRow.appendTo($col);
				$table.children().each(function(k, v){
					$(v).children()
						.eq(0).text(k).end()
						.eq(1).text('').end();
				});
				return $newRow;
			};
			var tableAddCol = function(col, data){
				var $newCol = $('<div class="driver_slide_col"></div>');
				if(typeof(col) !== 'undefined' && col < $table.children().length) {
					$newCol.insertBefore($table.children().eq(col));
					tableAddRow(col, 0, data);
				} else {
					$newCol.appendTo($table);
					tableAddRow($table.children().length-1, 0, data);
				}
				return $newCol;
			};
			var tableReset = function(content, curCol, curRow){
				$table.html('');
				if(!content.length) {
					tableAddCol();
				} else {
					for(var i=0; i<content.length; i++) {
						tableAddCol();
						var colContent = content[i];
						for(var j=1; j<colContent.length; j++)
							tableAddRow(i, j);
					}
				}
				tableSelect(curCol, curRow);
			};

			// table selector
			var curCol = 0;
			var curRow = 0;
			var tableSelect = function(col, row, prevCol, prevRow){
				if(typeof(prevCol) === 'undefined') prevCol = curCol;
				if(typeof(prevRow) === 'undefined') prevRow = curRow;
				tableHideSlide($table.children().eq(prevCol).children().eq(prevRow));
				var $cols = $table.children();
				if(col >= $cols.length)
					col = $cols.length - 1;
				if(col < 0)
					col = 0;
				var $col = $cols.eq(col);
				var $rows = $col.children();
				if(row >= $rows.length)
					row = $rows.length - 1;
				if(row < 0)
					row = 0;
				var $row = $rows.eq(row);
				curCol = col;
				curRow = row;
				tableShowSlide($row);
			};
			var tableHideSlide = function($row){
				$row.removeClass('driver_slide_row-selected');
				if($row[0]) $($row[0].contentTextarea).hide();
			};
			var tableShowSlide = function($row){
				$row.addClass('driver_slide_row-selected');
				if($row[0]) $($row[0].contentTextarea).show().focus();
			};
			var tableSaveSlide = function(){
				content[curCol][curRow] = $slide.children().val();
			};
			$table.on('click', '.driver_slide_row', function(){
				tableSaveSlide();
				var newCol = 0;
				var newRow = 0;
				var rowElem = this;
				var colElem = this.parentElement;
				$table.children().each(function(){
					if(this === colElem)
						return false;
					newCol++;
				});
				$table.children().eq(newCol).children().each(function(){
					if(this === rowElem)
						return false;
					newRow++;
				});
				tableSelect(newCol, newRow);
			});

			// slide controls
			var slideAddLeft = function(){
				tableSaveSlide();
				tableAddCol(curCol, '');
				content.splice(curCol, 0, ['']);
				tableSelect(curCol, 0, curCol+1, curRow);
			};
			var slideAddRight = function(){
				tableSaveSlide();
				tableAddCol(curCol+1, '');
				content.splice(curCol+1, 0, ['']);
				tableSelect(curCol+1, 0, curCol, curRow);
			};
			var slideAddTop = function(){
				tableSaveSlide();
				tableAddRow(curCol, curRow, '');
				content[curCol].splice(curRow, 0, '');
				tableSelect(curCol, curRow, curCol, curRow+1);
			};
			var slideAddBottom = function(){
				tableSaveSlide();
				tableAddRow(curCol, curRow+1, '');
				content[curCol].splice(curRow+1, 0, '');
				tableSelect(curCol, curRow+1, curCol, curRow);
			};
			var slideDel = function(){
				tableDelRow(curCol, curRow);
				if(content[curCol].length <= 1) {
					if(content.length === 1)
						content[0] = [''];
					else
						content.splice(curCol, 1);
				} else {
					content[curCol].splice(curRow, 1);
				}
				tableSelect(curCol, curRow);
			};
			$('.presentation .driver_slide_add-left').click(slideAddLeft);
			$('.presentation .driver_slide_add-right').click(slideAddRight);
			$('.presentation .driver_slide_add-top').click(slideAddTop);
			$('.presentation .driver_slide_add-bottom').click(slideAddBottom);
			$('.presentation .driver_slide_del').click(slideDel);

			// control key
			var slideLeft = function(){
				tableSelect(curCol-1, curRow);
			};
			var slideRight = function(){
				tableSelect(curCol+1, curRow);
			};
			var slideTop = function(){
				tableSelect(curCol, curRow-1);
			};
			var slideBottom = function(){
				tableSelect(curCol, curRow+1);
			};
			$slide.on('keyup', 'textarea', function(e){
				if(e.ctrlKey || e.metaKey) {
					if(e.shiftKey) {
						if(e.keyCode === 37) slideAddLeft();
						if(e.keyCode === 39) slideAddRight();
						if(e.keyCode === 38) slideAddTop();
						if(e.keyCode === 40) slideAddBottom();
					} else {
						if(e.keyCode === 37) slideLeft();
						if(e.keyCode === 39) slideRight();
						if(e.keyCode === 38) slideTop();
						if(e.keyCode === 40) slideBottom();
					}
					if(e.keyCode === 46) {
						e.preventDefault();
						slideDel();
					}
				}
			});

			// init data
			if(!data.driver) data.driver = {};
			var content = data.driver.content || [['']];
			tableReset(content, 0, 0);

			// events
			return {
				get: function(){
					tableSaveSlide();
					var abstract = $div.find('.driver_abstract textarea').val();
					return {
						driver: {
							enableHtml: $('.presentation .driver_use_html input').prop('checked'),
							abstract: abstract,
							content: content
						}
					};
				}
			};
		}
	});
});