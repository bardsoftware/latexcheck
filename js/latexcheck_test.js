var test = require("asyncjs").test;
var assert = require("assert");
var checkLatexCode = require("./main").checkLatexCode;
var tests = {
    "test: no error detection in comments": function() {
        var text = "Hey there, \%. % $ this should be deleted \\begin{equation} \nHi. % $$ once again, not checked \%";
        var result = checkLatexCode(text);
        assert.deepStrictEqual(result, {});
    },

    "test: comment deletion doesn't delete following lines": function() {
        var text = "Hi. % $$ \n$$x$$.";
        var result = checkLatexCode(text);
        assert.notStrictEqual(result.DOUBLE_DOLLARS, undefined);
    },

    "test: multiple errors made with addWarningQuick": function() {
        var text = "Here are three references \\eqref{hey}, \\eqref{hi} and also \\eqref{heyo}.";
        var result = checkLatexCode(text);
        assert.strictEqual(result.NONBREAKABLE_SPACE_BEFORE_REF.codeFragments.length, 3);
    },

    "test: not closed math is detected": function() {
        var text = "Math is not closed! $ ";
        var result = checkLatexCode(text);
        assert.notStrictEqual(result.MISMATCHED_MATH_DELIMITERS, undefined);
    },

    "test: multiple errors made with addAllWarningsLatexString": function() {
        var text = "Here's one formula: $$ e = mc^2.$$ Here's another: $$ 1 + e^{i \\pi} = 0.$$ That's it.";
        var result = checkLatexCode(text);
        assert.strictEqual(result.DOUBLE_DOLLARS.codeFragments.length, 4);
    },

    "test: MISMATCHED_MATH_DELIMITERS: snippets and line numbers": function() {
        function assertPair(firstDelimiter, secondDelimiter) {
            var text = firstDelimiter + " e = mc^2 " + secondDelimiter;
            var result = checkLatexCode(text);
            assert.notStrictEqual(result.MISMATCHED_MATH_DELIMITERS.codeFragments[0], undefined);
            assert.notStrictEqual(result.MISMATCHED_MATH_DELIMITERS.codeFragments[0].code, undefined);
            assert.strictEqual(result.MISMATCHED_MATH_DELIMITERS.codeFragments[0].line, 0);
        }

        var openingDelimiters = ["$", "$$", "\\(", "\\["];
        var closingDelimiters = ["$", "$$", "\\)", "\\]"];
        var delimiterCount = openingDelimiters.length;
        for (var i = 0; i < delimiterCount; ++i) {
            for (var j = 0; j < delimiterCount; ++j) {
                if (i !== j) {
                    assertPair(openingDelimiters[i], closingDelimiters[j]);
                }
                if (openingDelimiters[i] !== openingDelimiters[j]) {
                    assertPair(openingDelimiters[i], openingDelimiters[j]);
                }
            }
        }
    },

    "test: UNNECESSARY_FORMULA_BREAK: no duplication": function() {
        var text = "$ \\text{hey} $ $ \\text{there} $.";
        var result = checkLatexCode(text);
        assert.notStrictEqual(result.UNNECESSARY_FORMULA_BREAK.codeFragments.length, 2);
    },

    "test: SPACE_AFTER_PUNCTUATION_MARK: ignore \\,": function() {
        var text = "Эй\\,привет";
        var result = checkLatexCode(text);
        assert.strictEqual(result.SPACE_AFTER_PUNCTUATION_MARK, undefined);
    },

    "test: PERIOD_BEFORE_NEXT_SENTENCE: no false positives on whitespace or empty string and line number": function() {
        var text = "$e = mc^2$ $1 + e^{i\\pi} = 0$";
        var result = checkLatexCode(text);
        assert.strictEqual(result.PERIOD_BEFORE_NEXT_SENTENCE, undefined);
    },

    "test: PERIOD_BEFORE_NEXT_SENTENCE: line number": function() {
        var text = "$x$ Привет $y$";
        var result = checkLatexCode(text);
        assert.strictEqual(result.PERIOD_BEFORE_NEXT_SENTENCE.codeFragments[0].line, 1);
    },

    "test: MID_IN_SET_COMPREHENSION: several '|'s detected as '\\mid's within a single math formula and line numbers are present": function() {
        var text = "$ \\{x | x < 0\\} \\{y | y > 0\\}$";
        var result = checkLatexCode(text);
        assert.strictEqual(result.MID_IN_SET_COMPREHENSION.codeFragments.length, 2);
        assert.strictEqual(result.MID_IN_SET_COMPREHENSION.codeFragments[0].line, 1);
        assert.strictEqual(result.MID_IN_SET_COMPREHENSION.codeFragments[1].line, 1);
    },

    "test: MID_IN_SET_COMPREHENSION: several '\\mid's detected as '|'s within a single math formula and line numbers are present": function() {
        var text = "$ \\mid x + y \\mid \\le \\mid x \\mid + \\mid y \\mid $";
        var result = checkLatexCode(text);
        assert.strictEqual(result.MID_IN_SET_COMPREHENSION.codeFragments.length, 3);
        assert.strictEqual(result.MID_IN_SET_COMPREHENSION.codeFragments[0].line, 1);
        assert.strictEqual(result.MID_IN_SET_COMPREHENSION.codeFragments[1].line, 1);
        assert.strictEqual(result.MID_IN_SET_COMPREHENSION.codeFragments[2].line, 1);
    },

    "test: SYMBOLIC_LINKS: ignore lone numbers in math": function() {
        var text = "$1$";
        var result = checkLatexCode(text);
        assert.strictEqual(result.SYMBOLIC_LINKS, undefined);
    },

    "test: TEXT_IN_MATH_MODE: several warnings within a single math": function() {
        var text = "$ hello there stranger $";
        var result = checkLatexCode(text);
        assert.strictEqual(result.TEXT_IN_MATH_MODE.codeFragments.length, 3);
    },

    "test: TEXT_IN_MATH_MODE: lines are not ignored after '\\text'": function() {
        var text = "$\\text{} hello$";
        var result = checkLatexCode(text);
        assert.notStrictEqual(result.TEXT_IN_MATH_MODE, undefined);
    },

    "test: TEXT_IN_MATH_MODE: don't detect things like '\\sinh'": function() {
        var text = "$\\sinh$";
        var result = checkLatexCode(text);
        assert.strictEqual(result.TEXT_IN_MATH_MODE, undefined);
    },

    "test: NO_CONCLUSION: empty text should not fail": function() {
        var text = "";
        var result = checkLatexCode(text);
        // should not fail
    },

    "test: DASH_SURROUND_WITH_SPACES: don't recognize '\\,' after dash as an error": function() {
        var text = "Hey look --\\,a dash!";
        var result = checkLatexCode(text);
        assert.strictEqual(result.DASH_SURROUND_WITH_SPACES, undefined);
    },

    "test: BACKSLASH_NEEDED: don't detect keywords when they are parts of other words": function() {
        var text = "$sinz zsin zsinz$";
        var result = checkLatexCode(text);
        assert.strictEqual(result.BACKSLASH_NEEDED, undefined);
    }
}

test.testcase(tests).exec();
