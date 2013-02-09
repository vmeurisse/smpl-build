/* jshint node: true, camelcase: false */
var child_process = require('child_process');

/**
 * Run commands an return the result
 * @param {String} cmd Command to run
 * @param {Object|Function} opts (optional)
 * @param {Boolean} opts.silent Do not output command result to console. (default: true)
 * @param {String} opts.cwd Command working directory. (default: process.cwd())
 * @param {Function} opts.cb Callback when function is finished. (optional)
 * @param {Function} opts.fail Callback when function is finished with failled status. (default: opts.cb)
 * @return The created ChildProcess (@see node.js doc)
 */
function run(cmd, opts) {
	var result = {
		exitCode: 0,
		output: '',
		err: ''
	};
	opts = opts || {};
	if (typeof opts === 'function') {
		opts = {
			cb: opts
		};
	}
	if (opts.silent !== false) opts.silent = true;
	var options = {
		env: process.env,
		cwd: opts.cwd || process.cwd()
	};
	
	var proc = child_process.exec(cmd, options, function(err) {
		result.exitCode = err ? err.code : 0;
		if (err) {
			var msg = 'Command failed: <' + cmd + '>\n';
			msg += 'Exit code:' + err.code + '\n';
			msg += result.err + '\n';
			if (err.code === 127) msg += '\nVerify that ' + cmd.split(' ')[0] + ' is installed.';
			process.stdout.write(msg);
			if (opts.fail) return opts.fail(result);
		}
		if (opts.cb) {
			opts.cb(result);
		}
	});
	
	proc.stdout.on('data', function(data) {
		result.output += data;
		if (!opts.silent) {
			process.stdout.write(data);
		}
	});
	proc.stderr.on('data', function(data) {
		result.err += data;
		if (!opts.silent) {
			process.stderr.write(data);
		}
	});
	
	return proc;
}

exports.run = run;