import React from 'react';
import Cookies from "universal-cookie";

const cookies = new Cookies();

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      error: "",
      isAuthenticated: false,
    };
  }

  componentDidMount = () => {
    this.getSession();
  }

  parseJsonResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const body = await response.text();
      throw new Error(`Expected JSON but got ${contentType || "unknown content type"}: ${body.slice(0, 120)}`);
    }
    return response.json();
  }

  isResponseOk = (response) => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return this.parseJsonResponse(response);
  }

  // get session method
  getSession = () => {
    fetch("/api/session/", {
      credentials: "same-origin",
    })
      .then(this.isResponseOk)
      .then((data) => {
        const isAuthenticated = data.isAuthenticated ?? data.isauthenticated ?? false;
        this.setState({ isAuthenticated });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // get whoami
  whoami = () => {
    fetch("/api/whoami/", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    })
      .then(this.isResponseOk)
      .then((data) => {
        console.log("You're logged in as " + data.username);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  }

  handleUserNameChange = (event) => {
    this.setState({ username: event.target.value });
  }

  // login methods
  login = (event) => {
    event.preventDefault();

    fetch("/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookies.get("csrftoken"),
      },
      credentials: "same-origin",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    })
      .then(this.isResponseOk)
      .then(() => {
        this.setState({
          isAuthenticated: true,
          username: "",
          password: "",
          error: "",
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          error: "Wrong Username or password",
        });
      });
  }

  // logout method
  logout = () => {
    fetch("/api/logout/", {
      credentials: "same-origin",
    })
      .then(this.isResponseOk)
      .then(() => {
        this.setState({ isAuthenticated: false });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    if (!this.state.isAuthenticated) {
      return (
        <div className="container mt-3">
          <h1> React Cookie Auth</h1>
          <h2> Login </h2>
          <form onSubmit={this.login}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={this.state.username}
                onChange={this.handleUserNameChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={this.state.password}
                onChange={this.handlePasswordChange}
              />
              <div>
                {this.state.error && <small className="text-danger">{this.state.error}</small>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">LOGIN</button>
          </form>
        </div>
      );
    }

    return (
      <div className="container mt-3">
        <h1> React Cookie Auth </h1>
        <p>You are logged in!</p>
        <button className="btn btn-primary-mr-2" onClick={this.whoami}>WhoAmI</button>
        <button className="btn btn-danger" onClick={this.logout}>LOGOUT</button>
      </div>
    );
  }
}

export default App;