
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/components/Cell.svelte generated by Svelte v3.5.1 */

    const file = "src/components/Cell.svelte";

    function create_fragment(ctx) {
    	var div, t_value = ctx.isOpen ? (ctx.hasBomb ? '💣' : ctx.value > 0 ? ctx.value : '') : ctx.hasFlag ? '⛳' : '', t, div_class_value, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			div.className = div_class_value = "cell value--" + ctx.value + " svelte-yv550a";
    			toggle_class(div, "isOpen", ctx.isOpen);
    			add_location(div, file, 61, 0, 819);

    			dispose = [
    				listen(div, "click", ctx.click_handler),
    				listen(div, "contextmenu", prevent_default(ctx.contextmenu_handler))
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.isOpen || changed.hasBomb || changed.value || changed.hasFlag) && t_value !== (t_value = ctx.isOpen ? (ctx.hasBomb ? '💣' : ctx.value > 0 ? ctx.value : '') : ctx.hasFlag ? '⛳' : '')) {
    				set_data(t, t_value);
    			}

    			if ((changed.value) && div_class_value !== (div_class_value = "cell value--" + ctx.value + " svelte-yv550a")) {
    				div.className = div_class_value;
    			}

    			if ((changed.value || changed.isOpen)) {
    				toggle_class(div, "isOpen", ctx.isOpen);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { value = 0, hasFlag = false, hasBomb = false, isOpen = false } = $$props;

    	const writable_props = ['value', 'hasFlag', 'hasBomb', 'isOpen'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Cell> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('value' in $$props) $$invalidate('value', value = $$props.value);
    		if ('hasFlag' in $$props) $$invalidate('hasFlag', hasFlag = $$props.hasFlag);
    		if ('hasBomb' in $$props) $$invalidate('hasBomb', hasBomb = $$props.hasBomb);
    		if ('isOpen' in $$props) $$invalidate('isOpen', isOpen = $$props.isOpen);
    	};

    	return {
    		value,
    		hasFlag,
    		hasBomb,
    		isOpen,
    		click_handler,
    		contextmenu_handler
    	};
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["value", "hasFlag", "hasBomb", "isOpen"]);
    	}

    	get value() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasFlag() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasFlag(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasBomb() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasBomb(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const getRandomSequence = (totalCount, sequenceLength) => {
      const result = [];
      for (let i = 0; i < totalCount; i++) result[i] = i;

      for (let i = totalCount - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        result[j] = result[i] + result[j];
        result[i] = result[j] - result[i];
        result[j] = result[j] - result[i];
      }

      return result.slice(0, sequenceLength);
    };

    const bumpBombsCount = (board, x, y) => {
      const width = board[0].length;
      const height = board.length;
      if (x < 0 || x > width - 1 || y < 0 || y > height - 1) {
        return;
      }

      board[y][x].value++;
    };

    const buildBoard = (width, height, bombsCount) => {
      const bombs = getRandomSequence(width * height, bombsCount);

      const board = [];
      for (let i = 0; i < height; i++) {
        const rowCells = [];
        for (let j = 0; j < width; j++) {
          rowCells.push({ value: 0, hasBomb: false, isOpen: false });
        }
        board.push(rowCells);
      }
      for (let i = 0; i < bombs.length; i++) {
        const y = Math.floor(bombs[i] / width);
        const x = bombs[i] % width;
        board[y][x].hasBomb = true;
        bumpBombsCount(board, x - 1, y - 1);
        bumpBombsCount(board, x, y - 1);
        bumpBombsCount(board, x + 1, y - 1);
        bumpBombsCount(board, x - 1, y);
        bumpBombsCount(board, x + 1, y);
        bumpBombsCount(board, x - 1, y + 1);
        bumpBombsCount(board, x, y + 1);
        bumpBombsCount(board, x + 1, y + 1);
      }

      return board;
    };

    var difficultyLevels = [
      {
        name: "Beginner",
        values: {
          width: 8,
          height: 8,
          bombsCount: 10
        }
      },
      {
        name: "Intermediate",
        values: {
          width: 13,
          height: 15,
          bombsCount: 40
        }
      },
      {
        name: "Expert",
        values: {
          width: 16,
          height: 30,
          bombsCount: 99
        }
      }
    ];

    /* src/components/App.svelte generated by Svelte v3.5.1 */

    const file$1 = "src/components/App.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.cell = list[i];
    	child_ctx.j = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.difficultyLevel = list[i];
    	return child_ctx;
    }

    // (70:0) {#if isGameOver}
    function create_if_block(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("GAME OVER");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (74:6) {#each difficultyLevels as difficultyLevel}
    function create_each_block_2(ctx) {
    	var option, t_value = ctx.difficultyLevel.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.difficultyLevel;
    			option.value = option.__value;
    			add_location(option, file$1, 74, 8, 1880);
    		},

    		m: function mount(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (83:6) {#each row as cell, j}
    function create_each_block_1(ctx) {
    	var current;

    	var cell_spread_levels = [
    		ctx.cell
    	];

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	function contextmenu_handler() {
    		return ctx.contextmenu_handler(ctx);
    	}

    	let cell_props = {};
    	for (var i = 0; i < cell_spread_levels.length; i += 1) {
    		cell_props = assign(cell_props, cell_spread_levels[i]);
    	}
    	var cell = new Cell({ props: cell_props, $$inline: true });
    	cell.$on("click", click_handler);
    	cell.$on("contextmenu", contextmenu_handler);

    	return {
    		c: function create() {
    			cell.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var cell_changes = changed.board ? get_spread_update(cell_spread_levels, [
    				ctx.cell
    			]) : {};
    			cell.$set(cell_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			cell.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			cell.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			cell.$destroy(detaching);
    		}
    	};
    }

    // (81:2) {#each board as row, i}
    function create_each_block(ctx) {
    	var div, t, current;

    	var each_value_1 = ctx.row;

    	var each_blocks = [];

    	for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block_1(get_each_context_1(ctx, each_value_1, i_1));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}

    			t = space();
    			div.className = "row svelte-ii6i3m";
    			add_location(div, file$1, 81, 4, 2039);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(div, null);
    			}

    			append(div, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.board) {
    				each_value_1 = ctx.row;

    				for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    						each_blocks[i_1].i(1);
    					} else {
    						each_blocks[i_1] = create_each_block_1(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].i(1);
    						each_blocks[i_1].m(div, t);
    					}
    				}

    				group_outros();
    				for (; i_1 < each_blocks.length; i_1 += 1) outro_block(i_1, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) each_blocks[i_1].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) outro_block(i_1, 0, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var t0, div1, div0, select, t1, t2, t3, current, dispose;

    	var if_block = (ctx.isGameOver) && create_if_block();

    	var each_value_2 = difficultyLevels;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	var each_value = ctx.board;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			select = element("select");

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = text("\n    ⛳ x ");
    			t2 = text(ctx.remainingFlags);
    			t3 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			if (ctx.selectedDifficulty === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			add_location(select, file$1, 72, 4, 1750);
    			div0.className = "menu svelte-ii6i3m";
    			add_location(div0, file$1, 71, 2, 1727);
    			div1.className = "game svelte-ii6i3m";
    			add_location(div1, file$1, 70, 0, 1706);

    			dispose = [
    				listen(select, "change", ctx.select_change_handler),
    				listen(select, "change", ctx.onDifficultyChange)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, select);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, ctx.selectedDifficulty);

    			append(div0, t1);
    			append(div0, t2);
    			append(div1, t3);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.isGameOver) {
    				if (!if_block) {
    					if_block = create_if_block();
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.difficultyLevels) {
    				each_value_2 = difficultyLevels;

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_2.length;
    			}

    			if (changed.selectedDifficulty) select_option(select, ctx.selectedDifficulty);

    			if (!current || changed.remainingFlags) {
    				set_data(t2, ctx.remainingFlags);
    			}

    			if (changed.board) {
    				each_value = ctx.board;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div1);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

      let board;
      let selectedDifficulty = difficultyLevels[0];
      let remainingFlags = selectedDifficulty.values.bombsCount;
      onDifficultyChange();

      function onDifficultyChange() {
        const { width, height, bombsCount } = selectedDifficulty.values;
        $$invalidate('board', board = buildBoard(width, height, bombsCount));
        $$invalidate('remainingFlags', remainingFlags = selectedDifficulty.values.bombsCount);
      }

      let isGameOver = false;

      function openCell(i, j) {
        const { width, height } = selectedDifficulty.values;
        if (i >= 0 && i < height && j >= 0 && j < width && !board[i][j].isOpen) {
          board[i][j].isOpen = true; $$invalidate('board', board);
          if (board[i][j].hasBomb) {
            $$invalidate('isGameOver', isGameOver = true);
            return;
          }
          if (board[i][j].value === 0) {
            openCell(i - 1, j - 1);
            openCell(i, j - 1);
            openCell(i + 1, j - 1);
            openCell(i - 1, j);
            openCell(i + 1, j);
            openCell(i - 1, j + 1);
            openCell(i, j + 1);
            openCell(i + 1, j + 1);
          }
        }
      }

      function putFlag(i, j) {
        $$invalidate('remainingFlags', remainingFlags = board[i][j].hasFlag
          ? remainingFlags + 1
          : remainingFlags - 1);
        board[i][j].hasFlag = !board[i][j].hasFlag; $$invalidate('board', board);

        if (remainingFlags === 0) {
          if (board.some(row => row.some(cell => cell.hasBomb && !cell.hasFlag))) {
            console.log("nope!");
          } else {
            console.log("win!");
          }
        }
      }

    	function select_change_handler() {
    		selectedDifficulty = select_value(this);
    		$$invalidate('selectedDifficulty', selectedDifficulty);
    		$$invalidate('difficultyLevels', difficultyLevels);
    	}

    	function click_handler({ i, j }) {
    		return openCell(i, j);
    	}

    	function contextmenu_handler({ i, j }) {
    		return putFlag(i, j);
    	}

    	return {
    		board,
    		selectedDifficulty,
    		remainingFlags,
    		onDifficultyChange,
    		isGameOver,
    		openCell,
    		putFlag,
    		select_change_handler,
    		click_handler,
    		contextmenu_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    var app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
