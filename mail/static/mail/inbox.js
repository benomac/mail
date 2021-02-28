document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').addEventListener('submit', send_email);
  
  //maybe put change backgroun color in here???


  // By default, load the inbox
  
  load_mailbox('inbox');
  
});

function compose_email() {
  
  // Show compose view and hide other views
  
  document.querySelector('#view-emails-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  

  // Clear out composition fields
  
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Function to create list of email links for mailboxes

function make_list(thing, mailbox) {
  
  //Put this div outside the fetch as to make sure it loads in the right order each time!
  //Create a table for the emails
  const table = document.createElement('table');
  
  //Get each email by id
  fetch(`/emails/${thing.id}`)
  .then(response => response.json())
  .then(email => {
    
    //Guve the table classes
    table.className = `mailbox _${thing.id} form-control`;
    
    //Create an array to loop thrught to build the table
    let boxes = [email.sender, email.subject, email.timestamp];
    
    // show recipient if sent email box is loaded
    // It says in the spec to show the SENDER of emails,
    //this doesnt make much sense for the sent email box though,
    // so I changed it to show the recipients for sent mailbox.
    if (mailbox === "sent") {
      boxes = [email.recipients, email.subject, email.timestamp];
    }
    
    //loop through the boxes and creat a new div, for each part to be displayed, 
    //containing a div for each email item
    boxes.forEach(i => {
      
      // creaet a variable to be checked if the email is read or not.
      const read = email.read;
      
      // Create td element
      let td = document.createElement('td');
      td.className = "box_in_boxes";
      
      //Change backgroun color if email is read or not, uses the 'read' variable.
        if (read === true && mailbox !== "sent") {
          table.style.backgroundColor = "lightgrey";
        }
        
        // add event listener to open email
        td.addEventListener('click', function() {
          open_email(email.id, mailbox);
          if (email.read === false) {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            })
          }
        });
        
        //Append the item of boxes to the td
        td.append(i);

        //Append the td to the table.
        table.append(td);
      })
      

  });
  //Append the table to the view.
  document.querySelector('#emails-view').append(table);
};

//Function to open individual email.
function open_email(id, mailbox) {
  document.querySelector('#view-emails-view').innerHTML = '';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    
    // Create array to hold the relevant email elements.
    const show = {"Sender":email.sender, 
                  "Recipients":email.recipients, 
                  "Subject":email.subject,
                  "Date":email.timestamp, 
                  "Message":email.body}
    
    
    // Create button to archive or unarchive
    let button = document.createElement('button');
    button.className = "btn btn-sm btn-outline-primary"
    if (email.archived === false) {
      button.innerHTML = "Archive";
      button.id = "archive";
      button.onclick = function() {
      archive(email.id);
      };
    } else if (email.archived === true) {
      button.innerHTML = "Unarchive";
      button.id = "archive";
      button.onclick = function() {
      unarchive(email.id);
      }
    }; 

    //creat replay button
    let reply_button = document.createElement('button');
    reply_button.className = "btn btn-sm btn-outline-primary"
    reply_button.innerHTML = "Reply";
    button.id = "reply";
    reply_button.onclick = function() {
    reply(email.id);
    };
    
     
    // create div for opened email in view        
    for (const [key, value] of Object.entries(show)) {
      const email = document.createElement('div');
      const title = document.createElement('div');
      const content = document.createElement('div');
      title.className = "emailTitle"; 
      email.className = "email email_set";
      content.className = `emailContent_${key} email_set`;
      title.append(key, ":");
      content.append(value);
      email.append(title, content);   
    
    //Append email to the view.
    document.querySelector('#view-emails-view').append(email);
    
    //removes the archive button for sent messages.
    if (mailbox !== "sent") {
    document.querySelector('#view-emails-view').append(button);
    document.querySelector('#view-emails-view').append(reply_button);
    }
  }
   
});

  //Shows and hides the relevant views.
  document.querySelector('#view-emails-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
}

//Function to load emails into mailboxes
function load_mailbox(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    //start a forEach loop for email keys
    Object.keys(emails).forEach(key => {
      
      // create variable to hold email keys
      link_name = emails[key]
      
      //Check which mailbox is selected
      if (mailbox === 'sent') {
        //Call the make_lidt function to populate mailbox.
        make_list(link_name, mailbox)
          
      } else if (mailbox === 'inbox') {
        //Call the make_lidt function to populate mailbox.
        make_list(link_name, mailbox);
        
      } else if (mailbox === 'archive') {
        //Call the make_lidt function to populate mailbox.  
        make_list(link_name, mailbox)
        
      }
    })
    
});
  // Show the mailbox and hide other views
  document.querySelector('#view-emails-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

//Function to send email.
function send_email(event) {
  
  //event.preventDefault(); stops the form trying to open anpther page!!!!!!!!!
  event.preventDefault();
  
  // send info of email to emails view
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
    recipients: document.querySelector('#compose-recipients').value,
    subject: document.querySelector('#compose-subject').value,
    body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    
    // put this function here as it updates the sent messages without having to click on sent!
    // Loads the sent mailbox after sending an email.
    load_mailbox('sent') 
  });
}


// function to archive
function archive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
    //have to put a .then to make the page load with the updated archived stauts
  .then( function() {
    load_mailbox("inbox");
  })
  
};

//function to unarchive
function unarchive(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  //have to put a .then to make the page load with the updated archived stauts
  .then( function() {
    load_mailbox("inbox");
  })
  
};

// function to reply to email

function reply(id) {
  document.querySelector('#view-emails-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    //Add the original senders details.
    document.querySelector('#compose-recipients').value = email.sender;
    
    //Add subject to subject field prepended with 'Re:'.
    string = email.subject;
    if (string.includes('Re:') === false) {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    } else {
      document.querySelector('#compose-subject').value = email.subject;
    }
    
    //Add original email to body with relevant text.
    //Not the best way of doing things, but fits the spec. :-(
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ` + '\r\n' + '\r\n' + email.body;
    
    
});
}
