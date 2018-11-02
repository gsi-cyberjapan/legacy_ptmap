LZWURLCEncoder = new function() {
	this.symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~';
	this.masks = [
		0,
		0x00000001, 0x00000003, 0x00000007, 0x0000000f, 0x0000001f, 0x0000003f, 0x0000007f, 0x000000ff,
		0x000001ff, 0x000003ff, 0x000007ff, 0x00000fff, 0x00001fff, 0x00003fff, 0x00007fff, 0x0000ffff,
		0x0001ffff, 0x0003ffff, 0x0007ffff, 0x000fffff, 0x001fffff, 0x003fffff, 0x007fffff, 0x00ffffff,
		0x01ffffff, 0x03ffffff, 0x07ffffff, 0x0fffffff, 0x1fffffff, 0x3fffffff, 0x7fffffff, 0xffffffff
	];
	this.buffer_bits = 0;
	this.buffer_width = 0;
	this.buffer_code = '';
	this.buffer_index = 0;

	this.clear = function() {
		this.buffer_bits = 0;
		this.buffer_width = 0;
		this.buffer_code = '';
		this.buffer_index = 0;
	};

	this.set = function(c) {
		this.buffer_bits = 0;
		this.buffer_width = 0;
		this.buffer_code = c;
		this.buffer_index = 0;
	};

	this.get = function() {
		return this.buffer_code;
	};

	this.flush = function() {
		if(0 < this.buffer_width) {
			this.buffer_code += this.symbols.charAt(this.buffer_bits << (6 - this.buffer_width));
			this.buffer_bits = 0;
			this.buffer_width = 0;
		}
	};

	this.encodeSymbol = function(b, w) {
		if(w + this.buffer_width < 6) {
			this.buffer_bits = ((this.buffer_bits << w) | (b & this.masks[w]));
			this.buffer_width += w;
		} else {
			var s = 6 - this.buffer_width;
			w -= s;
			this.buffer_code += this.symbols.charAt((this.buffer_bits << s) | ((b >>> w) & this.masks[s]));
			while(6 <= w) {
				w -= 6;
				this.buffer_code += this.symbols.charAt((b >>> w) & this.masks[6]);
			}
			this.buffer_bits = (b & this.masks[w]);
			this.buffer_width = w;
		}
	};

	this.decodeSymbol = function(w) {
		var b = this.buffer_bits;
		if(w < this.buffer_width) {
			this.buffer_width -= w;
			this.buffer_bits &= this.masks[this.buffer_width];
			b >>>= this.buffer_width;
		} else {
			w -= this.buffer_width;
			while(6 <= w) {
				b = (b << 6) | this.symbols.indexOf(this.buffer_code.charAt(this.buffer_index++));
				w -= 6;
			}
			if(w == 0) {
				this.buffer_width = 0;
				this.buffer_bits = 0;
			} else {
				this.buffer_bits = this.symbols.indexOf(this.buffer_code.charAt(this.buffer_index++));
				this.buffer_width = 6 - w;
				b = (b << w) | (this.buffer_bits >>> this.buffer_width);
				this.buffer_bits &= this.masks[this.buffer_width];
			}
		}
		return b;
	};

	this.encode = function(plain) {
		this.clear();
		if(plain.length == 0) {
			this.encodeSymbol(0, 6);
			return this.get();
		}
		var last = plain.charAt(0);
		var bits = last.charCodeAt();
		if(bits < 128) {
			this.encodeSymbol(0x00000080 | bits, 9);
		} else {
			this.encodeSymbol(0x00020000 | bits, 18);
		}
		if(plain.length == 1) {
			this.encodeSymbol(0, 2);
			this.flush();
			return this.get();
		}
		var current = plain.charAt(1);
		var table = {};
		table[last] = 3;
		var tail = 3;
		var width = 2;
		var max = 4;
		var word = 2;
		var index = 1;
		while(++index < plain.length) {
			var next = plain.charAt(index);
			if((current + next) in table) {
				current += next;
			} else if(current in table) {
				this.encodeSymbol(table[current], width);
				table[last + current] = ++tail;
				if(max <= tail) {
					max <<= 1;
					width++;
				}
				last = current;
				current = next;
			} else {
				bits = current.charCodeAt(0);
				if(bits < 128) {
					this.encodeSymbol(0x00000080 | bits, width + 7);
				} else {
					this.encodeSymbol(0x00020000 | bits, width + 16);
				}
				table[current] = ++tail;
				table[last + current] = ++tail;
				if(max <= tail) {
					max <<= 1;
					width++;
				}
				last = current;
				current = next;
			}
		}
		if(current in table) {
			this.encodeSymbol(table[current], width);
			if(max <= ++tail) {
				width++;
			}
		} else {
			bits = current.charCodeAt(0);
			if(bits < 127) {
				this.encodeSymbol(0x00000080 | bits, width + 7);
			} else {
				this.encodeSymbol(0x00020000 | bits, width + 16);
			}
			if(max <= tail + 2) {
				width++;
			}
		}
		this.encodeSymbol(0, width);
		this.flush();
		return this.get().replace(/0+$/, "");
	};

	this.decode = function(code) {
		this.set(code);
		var table = [0, 7, 16];
		var width = 2;
		var max = 4;
		var current = this.decodeSymbol(width);
		if(current == 0) {
			return '';
		}
		var symbol = String.fromCharCode(this.decodeSymbol(table[current]));
		table.push(symbol);
		var plain = symbol;
		current = this.decodeSymbol(width);
		while(current) {
			var last = symbol;
			if(2 < current) {
				symbol = table[current];
			} else {
				symbol = String.fromCharCode(this.decodeSymbol(table[current]));
				table.push(symbol);
			}
			plain += symbol;
			table.push(last + symbol);
			if(max < table.length) {
				width++;
				max <<= 1;
			}
			current = this.decodeSymbol(width);
		}
		return plain;
	}
}();
