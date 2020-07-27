%lex

%%
\s+     "/* skip whitespace */";
':'            return 'DP';
'{'	       return 'LEFTP';
'}'	        return 'RIGHTP';
'['	         return 'LEFTC';
']'	         return 'RIGHTC';
','	         return 'COMMA';
"false"       return 'FALSE';
"true"		return 'TRUE' ;
"null"	     return 'NULL';
'-'?([1-9][0-9]*|'0')('.'[0-9]+)?(['e''E']['+''-']?[0-9]+)?[bslfdiBSLFDI] return 'FLOATSUFFIX';
[1-9][0-9]*|'0' return 'POSITIVE_INTEGER';
'-'?([1-9][0-9]*|'0')('.'[0-9]+)?(['e''E']['+''-']?[0-9]+)? return 'FLOAT';
'"'([']|[^'"''\\']|('\\'['"' '\\' '/' 'b' 'f' 'n' 'r' 't' 'u']))*'"' return 'STRING';
<<EOF>> return 'EOF';
([']|[^'"''\\':}\],]|('\\'['"' '\\' '/' 'b' 'f' 'n' 'r' 't' 'u']))* return 'STRINGWITHOUTQUOTE';
/lex

%start main

%%

main:jvalue 'EOF' {return $1};

jarray:'LEFTC' liste_jarray 'RIGHTC' {$$=$2};

liste_jarray:
  {$$=[]}
  | liste_jarray_value {$$=$1}
  | liste_jvalue {$$=$1}
;

liste_jarray_value:
  'POSITIVE_INTEGER' 'DP' jvalue 'COMMA' liste_jarray_value {$5[parseInt($1)]=$3; $$=$5}
  | 'POSITIVE_INTEGER' 'DP' jvalue	'COMMA' {var a={};a[parseInt($1)]=$3;$$=a }
  | 'POSITIVE_INTEGER' 'DP' jvalue	 {var a={};a[parseInt($1)]=$3;$$=a }
;

liste_jvalue:
	jvalue 'COMMA' liste_jvalue {$3.unshift($1);$$=$3}
	| jvalue	'COMMA' { $$=[$1] }
	| jvalue	 { $$=[$1] }
;

string:
  'STRING' { $$= $1.substring(1,$1.length-1)}
  | 'STRINGWITHOUTQUOTE' { $$=$1}
;

jvalue:
	'TRUE' {$$=true}
	|'FALSE' {$$=false}
	| string {$$=$1}
	| jobject {$$=$1}
	| jarray {$$=$1}
	|'NULL' {$$=null;}
	|'POSITIVE_INTEGER' {$$=parseInt($1)}
	|'FLOAT' {$$=parseFloat($1)}
	|'FLOATSUFFIX' {$$=parseFloat($1.substring(0,$1.length-1))}
;

jobject:'LEFTP' liste_jobject_value 'RIGHTP' {$$=$2};

liste_jobject_value:
	string 'DP' jvalue 'COMMA' liste_jobject_value {$5[$1]=$3; $$=$5}
	| string 'DP' jvalue	 {var a={};a[$1]=$3;$$=a }
	| {$$={}}
;