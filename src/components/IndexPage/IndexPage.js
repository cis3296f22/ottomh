import { useState } from 'react';
import { Button } from 'react-bootstrap';

import { Join } from '../';

export const IndexPage = () => {
    const [menu, setMenu] = useState("home");
    const onBackClick = () => { setMenu("home") };

    return (
        <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center text-center">
            <h1 className="display-1">OTTOMH</h1>

            {menu === "home" &&
                <>
                    <div className="d-grid gap-2">
                        <Button variant="primary" type="button" size="lg" onClick={() => setMenu("create")} className="mb-3">
                            Create new lobby
                        </Button>
                        <Button variant="primary" type="button" size="lg" onClick={() => setMenu("join")}>
                            Join a game
                        </Button>
                    </div>
                </>
            }

            {menu === "create" &&
                <>
                    <Join isCreate={true} onBackClick={onBackClick} />
                </>
            }

            {menu === "join" &&
                <>
                    <Join isCreate={false} onBackClick={onBackClick} />
                </>
            }
        </div>
    );
};