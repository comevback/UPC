export const checkType = (job_type) => {
    // list all kinds of tasks(such as C, C++, Java, Python, and more.. )
    let all_types = ["C", "C++", "Java", "Python", "Go", "JavaScript", "PHP", "Ruby", "Rust", "Swift", "Kotlin", "Scala", "R", "Haskell", "Perl", "Lua", "Erlang", "Clojure", "Groovy", "Fortran", "Julia", "OCaml", "Racket", "Scheme", "Common Lisp", "Bash", "PowerShell", "C#", "Dart", "TypeScript", "CoffeeScript", "F#", "Elixir", "Crystal", "Nim", "Pascal", "Objective-C", "Assembly", "Vim script", "Roff", "Dockerfile", "Makefile", "HTML", "CSS", "SCSS", "Less", "Vue", "React", "Angular", "Svelte", "Django", "Flask", "Spring", "Laravel", "Ruby on Rails", "Express", "Koa", "Nest", "Gin", "Beego", "Echo", "Fastify", "Nuxt", "Next", "Gatsby", "Hugo", "Jekyll", "Hexo", "Docusaurus", "VuePress", "React Native", "Flutter", "Ionic", "Cordova", "Electron", "NW.js", "NativeScript", "Weex", "Taro", "Uni-app", "Kotlin/Native", "React Native", "Flutter", "Ionic", "Cordova", "Electron", "NW.js", "NativeScript", "Weex", "Taro", "Uni-app", "Kotlin/Native"];
    // check if the job_type is in the list
    if (all_types.includes(job_type)) {
        console.log("Job type is " + job_type);
        return true;
    }
    else {
        console.log(job_type + " is not in the list");
        return false;
    }
}

