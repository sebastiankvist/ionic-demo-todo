// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('todo', ['ionic'])
/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
    .factory('Projects', function() {
      return {
        all: function() {
          var projectString = window.localStorage['projects'];
          if(projectString) {
            return angular.fromJson(projectString);
          }
          return [];
        },
        save: function(projects) {
          window.localStorage['projects'] = angular.toJson(projects);
        },
        newProject: function(projectTitle) {
          // Add a new project
          return {
            title: projectTitle,
            tasks: []
          };
        },
        getLastActiveIndex: function() {
          return parseInt(window.localStorage['lastActiveProject']) || 0;
        },
        setLastActiveIndex: function(index) {
          window.localStorage['lastActiveProject'] = index;
        }
      }
    })

    .controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {

      // A utility function for creating a new project
      // with the given projectTitle
      var createProject = function(projectTitle) {
        var newProject = Projects.newProject(projectTitle);
        $scope.projects.push(newProject);
        Projects.save($scope.projects);
        $scope.selectProject(newProject, $scope.projects.length-1);
      }

      // Load or initialize projects
      $scope.projects = Projects.all();

      // Grab the last active, or the first project
      $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

      // Called to create a new project
      $scope.newProject = function() {
        var projectTitle = prompt('Project name');
        if(projectTitle) {
          createProject(projectTitle);
        }
      };

      // Called to select the given project
      $scope.selectProject = function(project, index) {
        $scope.activeProject = project;
        Projects.setLastActiveIndex(index);
        $ionicSideMenuDelegate.toggleLeft(false);
      };

      $scope.deleteProject = function(project) {
        if (!$scope.projects || !project) {
          return;
        }

        var projects = [];

        for (var i = 0; i < $scope.projects.length; i++) {
          if ($scope.projects[i].title !== project.title) {
            projects.push({
              title: $scope.projects[i].title,
              tasks: $scope.projects[i].tasks,
            });
          }
        }

        $scope.projects = projects;

        // Inefficient, but save all the projects
        Projects.save($scope.projects);

        $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];
      };

      // Create our modal
      $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
        $scope.taskModal = modal;
      }, {
        scope: $scope
      });

      $scope.createTask = function(task) {
        if(!$scope.activeProject || !task) {
          return;
        }
        $scope.activeProject.tasks.push({
          title: task.title
        });
        $scope.taskModal.hide();

        // Inefficient, but save all the projects
        Projects.save($scope.projects);

        task.title = "";
      };

      $scope.deleteTask = function(task) {
        if (!$scope.activeProject || !task) {
          return;
        }

        var tasks = [];

        for (var i = 0; i < $scope.activeProject.tasks.length; i++) {
          if ($scope.activeProject.tasks[i].title !== task.title) {
            tasks.push({
              title: $scope.activeProject.tasks[i].title
            });
          }
        }

        $scope.activeProject.tasks = tasks;

        // Inefficient, but save all the projects
        Projects.save($scope.projects);
      };

      $scope.newTask = function() {
        $scope.taskModal.show();
      };

      $scope.closeNewTask = function() {
        $scope.taskModal.hide();
      }

      $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };


      // Try to create the first project, make sure to defer
      // this by using $timeout so everything is initialized
      // properly
      $timeout(function() {
        if($scope.projects.length == 0) {
          while(true) {
            var projectTitle = prompt('Your first project title:');
            if(projectTitle) {
              createProject(projectTitle);
              break;
            }
          }
        }
      });

    });