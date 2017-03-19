// Single Page Application experimenting with campground comments.
//
// Use jQuery and AJAX to hijack node/express route to handle campground 
// comment delete events.
// Eventually, I may add in events to do comment editing.

// DELETE request
// 
// We need to change the event listener for the single page app.
// we need to be able to attach an event listener to a list item
// that has yet to be created. 
//
$('.comment-list').on('submit','.form-delete-comment', function(event) {
    event.preventDefault();
    var confirmResponse = confirm('Are you sure?');
    if (confirmResponse) {
        var formAction = $(this).attr('action');
        var itemToDelete = $(this).parent().parent('.comment-list');
        console.log("Forming AJAX DELETE request, formAction="+formAction);
        console.log("HTML item to delete= "+itemToDelete);
        $.ajax({
            url: formAction,
            type: 'DELETE',
            itemToDelete: itemToDelete,
            success: function(data) {
                console.log("Response from AJAX DELETE request:" + JSON.stringify(data,null,'\t'));
                if (itemToDelete) {
                    itemToDelete.remove();
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log("AJAX DELETE didn't work!!!:" + JSON.stringify(XMLHttpRequest,null,'\t'));
                console.log("Status: " + textStatus); 
                console.log("Error: " + errorThrown); 
            }                   
        });
    } else {
        // unselect the delete button if the user bailed out of deleting
        // a comment.
        $(this).find('i.fa-trash-o').blur();
    }
});