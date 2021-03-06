/*
 * name: main.js
 * Authors: Tanner Garrett, Brandon Thepvongsa
 * Description: JavaScript used to create the functionality of FolderDocs
 * TODO:
 * -Marked.js has been changed to not enclose given markup in <p> tags, need
 * to create own renderer later
*/

var googAuth;




/* BEGIN GOOGLE DRIVE AUTHENTICATION SECTION */

$(document).ready(function() {
	$("#dboxButton").on("click", connectDropbox);
    // $("#gdriveButton").on("click", connectDrive);
    // Solution is to not have so many callbacks before actually calling window.open.
    //If we can reduce the callbacks the window will appear without any issue
    $("#gdriveButton").click(function() {
         authorizeDrive(function(auth) {
            // Use this button to bind the authorization object
            googAuth = auth;
            console.log('Auth set to: ' + auth);
        });
        $(this).html("<img src='./images/spinner.gif' alt='spinner' />");
        setTimeout(function() {
            $("#gdriveButton").remove();
            $("#buttons").append("<button class='btn btn-default' id='gSignInButton'>Sign in to Google Drive</button>");
            $("#gSignInButton").click(function() {
                $(this).html("<img src='./images/spinner.gif' alt='spinner' />");
                console.log("Checking Auth");
                console.log(googAuth);
                if (googAuth.isSignedIn.get()) {
                    loadDriveAPI();
                } else {
                    console.log("Attempting Sign In");
                    // Need to have them sign in
                    googAuth.signIn().then(function() {
                        loadDriveAPI();

                    }, function(error) {
                        // Failed to authenticate for some reason
                        googleAuth.reject(error);
                    });
                }
            });
        }, 1000);

    });

    // Loads the drive API, and resolves the promise
    function loadDriveAPI() {
        gapi.client.load('drive', 'v2', function() {
            // Once this callback is executed, that means we've authorized just as expected
            // and can therefore resolve the promise
            connectDrive();
        });
    }

    // Directs the client to Google Drive's authentication page to sign in.
    function connectDrive() {
        console.log('Attempting to connect');
        var store = "Google Drive";

        console.log('Successful Authentication!');
        authenticatedClient = gapi.client;
        constructIMObject(store);
    }

    // This function returns a promise that handles our authentication
    function authorizeDrive(next) {
        console.log("Authorizing Drive");
      // Your Client ID can be retrieved from your project in the Google
      // Developer Console, https://console.developers.google.com
      var CLIENT_ID = '681676105907-omec1itmltlnknrdfo150qcn7pdt95ri.apps.googleusercontent.com';
      // Need full permissions for everything to work. This is the easiest option
      var SCOPES = ['https://www.googleapis.com/auth/drive'];


        // Load the newer version of the API, the old version is a pain to deal with
        gapi.load('auth2', function() {
            gapi.auth2.init({
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
            });

            next(gapi.auth2.getAuthInstance());
        });
    }

	//initialize context menu
	$.contextMenu({
            selector: '.context-menu-one',
            items: {
                "edit": {
                	name: "Edit DisplayText",
                	callback: function(e) {
                		var element = $(this);
                		selectAssociation(element);
                	},
									icon: function(opt, $itemElement, itemKey, item){
											// Set the content to the menu trigger selector and add an bootstrap icon to the item.
											$itemElement.html('<span class="glyphicon glyphicon-edit" aria-hidden="true"></span> Edit displaytext' + opt.selector);

											// Add the context-menu-icon-updated class to the item
											return 'context-menu-icon-updated';
									},
                },
                "open": {
                	name: "Open Subfolder",
                	callback: function(e) {
                		var elementGUID = $(this).attr('data-guid');
                		if(im.isAssociationAssociatedItemGrouping(elementGUID)) {
                			navigateMirror(elementGUID);
                		}
                	},
									icon: function(opt, $itemElement, itemKey, item){
											// Set the content to the menu trigger selector and add an bootstrap icon to the item.
											$itemElement.html('<span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span> Open folder' + opt.selector);

											// Add the context-menu-icon-updated class to the item
											return 'context-menu-icon-updated';
									},
                	// Disabled if the element is a non-grouping item
                	disabled: function() {return !im.isAssociationAssociatedItemGrouping($(this).attr('data-guid')); }
                },
                "copy" : {
                	name: "Copy",
                	disabled: true,
									icon: function(opt, $itemElement, itemKey, item){
											// Set the content to the menu trigger selector and add an bootstrap icon to the item.
											$itemElement.html('<span class="glyphicon glyphicon-copy" aria-hidden="true"></span> Copy' + opt.selector);

											// Add the context-menu-icon-updated class to the item
											return 'context-menu-icon-updated';
									},
                },
                "moveUp": {
                	name: "Move Association Up",
                	callback: function(e) {
                		var element = $(this);
                		element.prev().before(element);
                		saveOrder();
                	},
									icon: function(opt, $itemElement, itemKey, item){
											// Set the content to the menu trigger selector and add an bootstrap icon to the item.
											$itemElement.html('<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span> Move up' + opt.selector);

											// Add the context-menu-icon-updated class to the item
											return 'context-menu-icon-updated';
									},
                	// Disabled if there is no element before it in the list or if it is a non-grouping item
                	disabled: function() {return (!$(this).prev()[0]); }
                },
                "moveDown": {
                	name: "Move Association Down",
                	callback: function(e) {
                		var element = $(this);
                		element.next().after(element);
                		saveOrder();
                	},
									icon: function(opt, $itemElement, itemKey, item){
											// Set the content to the menu trigger selector and add an bootstrap icon to the item.
											$itemElement.html('<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> Move down' + opt.selector);

											// Add the context-menu-icon-updated class to the item
											return 'context-menu-icon-updated';
									},
                	// Disabled if there is no element after it in the list or if it is a non-grouping item
                	disabled: function() {return (!$(this).next()[0]); }
                },
                "delete": {
                	name: "Delete",
                	disabled: true,
									icon: function(opt, $itemElement, itemKey, item){
											// Set the content to the menu trigger selector and add an bootstrap icon to the item.
											$itemElement.html('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete' + opt.selector);

											// Add the context-menu-icon-updated class to the item
											return 'context-menu-icon-updated';
									},
                },
                "sep1": "----------",
                "openInCloud": {
                	name: "Open in Cloud Store",
                	callback: function(e) {
                        var elementGUID = $(this).attr("data-guid");
                        var url = im.getPublicURL(elementGUID);
                        window.open(url);
                    }
                }
            }
        });
});

/****************************
End Google Drive Authentication
****************************/

var
	im,
	rootMirror,
	previous,
	associations,
	dropboxClientCredentials,
	selectedAssociation,
	dropboxClient,
	gapi;

dropboxClientCredentials = {
	key: config.key,
	secret: config.secret
};

dropboxClient = new Dropbox.Client(dropboxClientCredentials);

dropboxClient.authDriver(new Dropbox.AuthDriver.Popup({
	receiverUrl: config.dropboxURL
}));

var authenticatedClient = null;

function getClient() {
	return authenticatedClient;
}

// Directs the client to Dropbox's authentication page to sign in.
function connectDropbox() {
	var store = "Dropbox";
	if(authenticatedClient) {
		console.log('Dropbox authenticated');
	} else {
		console.log('Dropbox authenticating...');
		dropboxClient.authenticate(function (error, client) {
			if(error) {
				console.log('Dropbox failed to authenticate');
			} else {
				authenticatedClient = client;
				console.log('Dropbox authenticated');
                $("#dboxButton").html("<img src='./images/spinner.gif' alt='spinner' />");
				constructIMObject(store);
			}
		});
	}
}

// Signs current client out of Dropbox
function disconnectDropbox() {
	dropboxClient.signOut();
}

// Called upon the successful authentication from Dropbox or
// Google Drive, initiates our first itemMirror object
function constructIMObject(store) {
	im = new ItemMirror("Thisisastring", function(error, newMirror) {
		if(error) {
			console.log(error);
		} else {
			im = newMirror; // Here is our new itemMirror object

			// This next block skips directly into our selected
			// store, or else we would be displaying them again.
      if(store) {
      	associations = im.listAssociations();
      	for(var i =0; i < associations.length; i++) {
      		var displayText = im.getAssociationDisplayText(associations[i]);
      		if(displayText == store) {
      			navigateMirror(associations[i]);
      		}
      	}
      } else {
      	refreshIMDisplay();
      }
		}
	});
}



// Deletes all elements in the display, then populates the list with paragraphs for each
// association (WiP).
function refreshIMDisplay() {

	// Hides the jumbotron if we are already authenticated
	if(getClient()) {
		$(".jumbotron").hide();
	}

	var entryDisplayName;
	$("#groupingItems").empty();
	$("#nonGroupingItems").empty();

	// Creates the previous/back button
	printToolbar();

	associations = im.listAssociations();
	var length = associations.length;

	// // Grab associations and organize them by type
	// var groupingItems = [];
	// var nonGroupingItems = [];
	// for(var i = 0; i < length; i++) {
	// 	if(im.isAssociationAssociatedItemGrouping(associations[i])) {
	// 		groupingItems.push(associations[i]);
	// 	} else {
	// 		nonGroupingItems.push(associations[i]);
	// 	}
	// }

	// Prints out items in alphabetical order
	printAssociations(orderAssociations(associations), $("#groupingItems"));
	// printAssociations(nonGroupingItems.sort(), $("#nonGroupingItems"));

	createClickHandlers();
}

// Handles the ordering of the associations (folders), allowing for
// the saving and ordering of individual associations
function orderAssociations(associationList) {
	var orderedItems = [];
	var nonOrderedItems = [];

  // Check if this fragment has sorting, or if we should default set it
	var hasSorting = im.getFragmentNamespaceAttribute('sorting', 'folder-docs-sorting');
  if(hasSorting == 'true') {
  	for(var i = 0; i < associationList.length; i++) {
  		var guid = associationList[i];
  		var placement = im.getAssociationNamespaceAttribute('order', guid, 'folder-docs');
  		if(placement) {
  			orderedItems[placement] = guid;
  		} else {
  			nonOrderedItems.push(guid);
  		}
  	}
  } else {
    // Grab associations and organize them by type
    var groupingItems = [];
    var nonGroupingItems = [];
    for(var i = 0; i < associationList.length; i++) {
    	if(im.isAssociationAssociatedItemGrouping(associationList[i])) {
    		nonOrderedItems.push(associationList[i]);
    	} else {
    		orderedItems.push(associationList[i]);
    	}
    }
  }
	// Return an array of unorderedItems + orderedItems (in that order)
	return nonOrderedItems.concat(orderedItems);
}

// Prints all the associations to the screen
function printAssociations(associationList, div) {
	for(var i = 0; i < associationList.length; i++) {
		var originalDisplayText = im.getAssociationDisplayText(associationList[i]);
		var appendingObject = associationMarkup(associationList[i]);
		div.append(appendingObject);
		$("#" + associationList[i]).data("originalDisplayText", originalDisplayText);
	}
}

// Creates the JS click handlers for the various associations and links
// Also creates the handlers for the textbox editing of associations
function createClickHandlers() {
	handleDisplaytextClicks();

	$('.contenteditable').on('blur', function() {
		var element = $(this);
		textboxHandler(element);
  });

    $('.glyphicon-folder-open').on('click', function(e) {
        var guid = $(this).attr("data-guid");
        navigateMirror(guid);
    });

    $('.glyphicon-file').on('click', function(e) {
        var guid = $(this).parent().parent().attr("data-guid");
        var url = im.getPublicURL(guid);
        window.open(url);
    });

	$("#groupingItems").sortable({
		cancel: ':input,button,.contenteditable',
    handle: '.sortingHandle',
		stop: function() {
			saveOrder();
		}

	});

	$("#previous-link").on("click", navigatePrevious);

    $("#root-link").on("click", navigateRoot);
}

// Handles the logic and timing of the single vs double clicks on
// display text. Single clicks select the association in preperation
// to enter edit mode upon another single click, double clicks navigate
// to that itemmirror object
function handleDisplaytextClicks() {
	var DELAY = 350, clicks = 0, timer = null;
	$('.association-row').on("click", function(e) {
		clicks++;  // count clicks
		var element = $(this);
		// Check if the element has been selected already
		var alreadySelected = element.hasClass('selected-association');
		selectAssociation(element);
		if(clicks === 1) {
			timer = setTimeout(function() {
				// Single click case
				clicks = 0; // reset counter

			}, DELAY);
		// If element is a grouping item
		} else if(im.isAssociationAssociatedItemGrouping(element.attr('data-guid'))) {
			// Double click case
			clearTimeout(timer);    //prevent single-click action
			var element = $(this);
			var guid = element.attr('data-guid');
			navigateMirror(guid);
			clicks = 0; // reset counter
		 }})
		 .on("dblclick", function(e){
			 e.preventDefault();  // prevent default dblclick event
		 });
	}

// Selects an itemMirror associaton
function selectAssociation(element) {
	if(selectedAssociation) {
    // Remove the contenteditable from the previous association
    var guid = selectedAssociation.attr('data-guid');
    $(".contenteditable[data-guid='" + guid + "']").prop('contenteditable', 'false');
    selectedAssociation.removeClass('selected-association');
  }
	element.addClass('selected-association');
  // Now we need to make this one contenteditable
  var guid = element.attr('data-guid');
  $(".contenteditable[data-guid='" + guid + "']").prop('contenteditable', 'true');
	selectedAssociation = element;
}

// Takes in the row element of the clicked association, selects it
// by saving the guid as the currently selected guid and highlights
// the association in view by placing a border around it.
function editboxAssociation(element) {
  alert('second click');
	// if(element.hasClass('selected-association')) {
	// 	// The clicked element is the currently selected element, let's
	// 	// toggle into edit
		var guid = element.attr('data-guid');
		//var textbox = $('#' + guid);
		$(".contenteditable[data-guid='" + guid + "']").prop('contenteditable', 'true');
		// textbox.show();
		// textbox.putCursorAtEnd();
	//}
}


// Handles the showing/hiding/saving functionality of the edit textareas
function textboxHandler(element) {
	var guid = element.attr('data-guid');
	var newText = element.html();

  console.log('guid:' + guid);
  console.log('text:' + newText);
	im.setAssociationDisplayText(guid, newText);
	saveMirror();
}

// Saves the current itemMirror object
function saveMirror() {
	im.save(function(error) {
		if(error) {
			console.log('Save Error: ' + error);
		} else {
			console.log('Successfully saved.');
		}
	});

}

// Refreshes the itemMirror object
function refreshMirror() {
	im.refresh(function(error) {
		if(error) {
			console.log('Refresh error:' + error);
		}
	});
}

// Attempts to navigate and display a new itemMirror association
function navigateMirror(guid) {
	im.createItemMirrorForAssociatedGroupingItem(guid, function(error, newMirror) {

		if(!error) {
			im = newMirror;

      if(!rootMirror) {
        rootMirror = im; // Save root to be used for home button and root fragment saving
      }

      refreshIMDisplay();
		} else {
			console.log(error);
		}
	});

}

// Navigates and refreshes the display to the previous mirror
function navigatePrevious() {
    var previous = im.getCreator();

    if(previous) {
        im = previous;
        refreshIMDisplay();
    }
}


// Navigates to the root mirror
function navigateRoot() {
    if(rootMirror) {
        im = rootMirror;
        refreshIMDisplay();
    }

}


// Prints the previous link to go back up to parent/creator
function printToolbar() {
	var result = "";
	var previous = im.getCreator();

	// Print the fragment name
	var displayText = "<h3 class='folder-name'>" + im.getDisplayName() + "</h3>";
    $("#toolbar h3").html(displayText);

    $('#button-toolbar').empty();

    // Prints the home/root button
    var homeButton = "<button type='button' class='btn btn-default' id='root-link'>"
        + "<span class='glyphicon glyphicon glyphicon-home'></span> Home</button>";

    $('#button-toolbar').append(homeButton);

	// Print the previous link if we have one
	if(previous) {
		var previousButton = "<button type='button' class='btn btn-default' id='previous-link'>"
		+ "<span class='glyphicon glyphicon glyphicon-level-up'></span> Back</button>";
        $('#button-toolbar').append(previousButton);
	}

	return result;
}


// Attempts to save the order of the associations by matching
// each associations guid with the array of guids returned on a reordering drop.
function saveOrder() {
	var displayedAssocs = $("#groupingItems").sortable("toArray", {attribute: 'data-guid'});
	// Loop through each association
	for(var i = 0; i < associations.length; i++) {
		// Loop through each association we grabbed from the drop event
		for(var k = 0; k < displayedAssocs.length; k++) {
			// Find where the guids match, k will equal the proper order placement
			// when we find a match
			if(associations[i] == displayedAssocs[k]) {
				im.setAssociationNamespaceAttribute('order', k, associations[i], 'folder-docs');
			}
		}
	}

	// Save a boolean to say that this itemMirror has sorting now.
	im.setFragmentNamespaceAttribute('sorting', 'true', 'folder-docs-sorting');

	// After we've set all the proper namespace attributes, let's save the itemMirror
	saveMirror();
}

// Returns the markup for an association to be printed to the screen
// Differentiates between a groupingItem and nonGroupinItem via icon
function associationMarkup(guid) {
	var originalDisplayText = im.getAssociationDisplayText(guid);
	var displayTextWithMarkdown = marked(originalDisplayText);
	var functionCall = "navigateMirror(" + guid + ")";
	var markup = "<div data-guid='" + guid + "' class='row association-row context-menu-one'>" +

  // drag icon column
  "<div class='col-xs-1'>" +
  "<div class='sortingHandle'><span class='glyphicon glyphicon-sort' /></div>" +
  "</div>" +

  // content column
  "<div class='col-xs-10'>" +
  "<div contenteditable='false' class='contenteditable' data-guid='" + guid + "'>" + originalDisplayText + "</div>" +
	"</div>" +

  // icon column
	"<div class='col-xs-1'>";

	if(im.isAssociationAssociatedItemGrouping(guid)) {
		markup += "<span data-guid='" + guid + "' class='association association-grouping glyphicon glyphicon-folder-open'></span></div>";
	} else {
		markup += "<span data-guid='" + guid + "' class='association association-file glyphicon glyphicon-file'></span></div>";
	}


	return markup;

}
