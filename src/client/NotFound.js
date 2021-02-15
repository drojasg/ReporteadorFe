import React from "react";

const NotFound = () => {
    return (
        <div>
            <h1>Not Found (#404)</h1>
            <code className="red-text">{location.pathname}</code>
        </div>
    );
};

export default NotFound;
