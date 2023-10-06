interface repoChecker{
    method checkRepo
}

class DotIgnoreDetails impliments repoChecker {
    // define method checkRepo
}

class HasApiDirectory impliments repoChecker {
    // define method checkRepo
}

obj1 = new HasApiDirectory()
obj2 = new DotIgnoreDetails()

method doRepoCheck(repoChecker obj){
    obj.checkRepo()
}

