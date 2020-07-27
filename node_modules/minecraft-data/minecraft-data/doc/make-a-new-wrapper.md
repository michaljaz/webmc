# Making a new wrapper

minecraft-data has currently a few wrapper (see the list in the README) for several languages.
If you want to use minecraft-data in a new language, you might want to create a wrapper for that language.

Here is a simple way to do it :

* create a git repo
* add minecraft-data as a submodule : 
  `git submodule add https://github.com/PrismarineJS/minecraft-data.git`
* add code in your language to read the json files
* add some code to index the data by name, by id to provide an api like 
[api.md](https://github.com/PrismarineJS/node-minecraft-data/blob/master/doc/api.md)
* add some readme and doc to explain that api
* add a basic example
* add files to package your module (for example in js it's a package.json, in python a setup.py)
* publish it

If it makes sense to generate files of your language from the data instead of dynamically reading the .json,
 feel free to do it (example of that in [ProtocolGen](https://github.com/Johni0702/ProtocolGen) for java)